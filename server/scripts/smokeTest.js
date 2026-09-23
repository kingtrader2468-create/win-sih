require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDatabase = require('../src/config/db');

async function runSmokeTests() {
  console.log('\n========================================');
  console.log('🧪 POLAR INDIA HUB — END-TO-END SMOKE TESTS');
  console.log('========================================\n');

  let server;
  let baseUrl;

  // 1. Establish database connection if not already connected
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDatabase();
      console.log('✔ MongoDB connection initialized.');
    } catch (err) {
      console.error('✘ Failed to connect to MongoDB:', err.message);
      process.exit(1);
    }
  }

  // 2. Check if a local server is already running on port 5000, else spin up ephemeral server
  const runningPort = Number(process.env.PORT) || 5000;
  const isPortAvailable = await new Promise((resolve) => {
    const testReq = http.get(`http://localhost:${runningPort}/api/health`, (res) => {
      resolve(true);
    });
    testReq.on('error', () => resolve(false));
    testReq.setTimeout(1000, () => {
      testReq.destroy();
      resolve(false);
    });
  });

  if (isPortAvailable) {
    baseUrl = `http://localhost:${runningPort}/api`;
    console.log(`✔ Testing against active server on ${baseUrl}`);
  } else {
    server = app.listen(0);
    const ephemeralPort = server.address().port;
    baseUrl = `http://localhost:${ephemeralPort}/api`;
    console.log(`✔ Ephemeral test server listening on ${baseUrl}`);
  }

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function assertEndpoint(title, method, path, body = null, headers = {}, validate = null) {
    totalTests++;
    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      if (body) {
        opts.body = JSON.stringify(body);
      }

      const res = await fetch(`${baseUrl}${path}`, opts);
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok && res.status !== 200 && res.status !== 201) {
        throw new Error(`HTTP ${res.status}: ${data.error?.message || text.slice(0, 120)}`);
      }

      if (validate) {
        validate(data, res);
      }

      console.log(`  ✔ [PASS] ${title} (${method} ${path})`);
      passedTests++;
      return data;
    } catch (err) {
      console.error(`  ✘ [FAIL] ${title} (${method} ${path}): ${err.message}`);
      failedTests++;
      return null;
    }
  }

  try {
    // 1. Health
    await assertEndpoint('Health Check', 'GET', '/health', null, {}, (data) => {
      if (!data.ok || data.database !== 'connected') {
        throw new Error('Database is not reporting connected state');
      }
    });

    // 2. Global Search
    await assertEndpoint('Global Search', 'GET', '/search?q=ice', null, {}, (data) => {
      if (!Array.isArray(data.results)) throw new Error('Missing results array');
      if (!Array.isArray(data.research)) throw new Error('Missing categorized research array');
    });

    // 3. Dashboard
    await assertEndpoint('Home Dashboard Aggregates', 'GET', '/dashboard', null, {}, (data) => {
      if (!data.counts || typeof data.counts.research !== 'number') {
        throw new Error('Missing counts.research aggregate');
      }
      if (!Array.isArray(data.featuredResearch)) throw new Error('Missing featuredResearch');
    });

    // 4. Research Explorer List
    const researchList = await assertEndpoint('Research List', 'GET', '/research?limit=4', null, {}, (data) => {
      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('Expected at least one research paper');
      }
    });

    const sampleResearchId = researchList?.items?.[0]?._id;
    if (!sampleResearchId) throw new Error('No sample research ID found');

    // 5. Research Detail & Findings
    const researchDetail = await assertEndpoint('Research Detail', 'GET', `/research/${sampleResearchId}`, null, {}, (data) => {
      if (!data.resource || data.resource._id !== sampleResearchId) {
        throw new Error('Research resource detail mismatch');
      }
    });

    // 6. Mark Research Explored
    await assertEndpoint('Mark Research Explored', 'POST', `/research/${sampleResearchId}/explore`, {});

    // 7. AI Analysis (with Fallback)
    await assertEndpoint('AI Contextual Analysis', 'POST', `/research/${sampleResearchId}/analyze`, {}, {}, (data) => {
      if (!data.summary || !Array.isArray(data.keyFindings)) {
        throw new Error('Analysis response missing summary or keyFindings');
      }
    });

    // 8. AI Contextual Chat
    await assertEndpoint('AI Contextual Chat', 'POST', `/research/${sampleResearchId}/chat`, {
      message: 'What was measured in this research?'
    }, {}, (data) => {
      if (!data.answer) throw new Error('Missing AI answer');
    });

    // 9. Evidence Graph
    const sampleFindingId = researchDetail?.findings?.[0]?._id;
    if (sampleFindingId) {
      await assertEndpoint('Evidence Provenance Graph', 'GET', `/evidence/${sampleFindingId}`, null, {}, (data) => {
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('Evidence graph missing nodes or edges array');
        }
      });

      // 10. Mark Evidence Investigated
      await assertEndpoint('Mark Evidence Investigated', 'POST', `/evidence/${sampleFindingId}/investigate`, {});
    }

    // 11. Catalogs
    const expeditions = await assertEndpoint('Catalog: Expeditions', 'GET', '/expeditions', null, {}, (data) => {
      if (!Array.isArray(data.items)) throw new Error('Expeditions missing items array');
    });
    const sampleExpeditionId = expeditions?.items?.[0]?._id;
    if (sampleExpeditionId) {
      await assertEndpoint('Catalog: Expedition Detail', 'GET', `/expeditions/${sampleExpeditionId}`);
    }

    await assertEndpoint('Catalog: Datasets', 'GET', '/datasets');
    await assertEndpoint('Catalog: Stations', 'GET', '/stations');
    await assertEndpoint('Catalog: Publications', 'GET', '/publications');
    await assertEndpoint('Catalog: Media', 'GET', '/media');

    // 12. Mysteries
    const mysteries = await assertEndpoint('Mysteries List', 'GET', '/mysteries', null, {}, (data) => {
      if (!Array.isArray(data.mysteries)) throw new Error('Mysteries list missing');
    });

    const sampleMysteryId = mysteries?.mysteries?.[0]?._id;
    if (sampleMysteryId) {
      await assertEndpoint('Mystery Detail', 'GET', `/mysteries/${sampleMysteryId}`);
      await assertEndpoint('Mystery Result', 'GET', `/mysteries/${sampleMysteryId}/result`);
    }

    // 13. Quizzes
    await assertEndpoint('Quizzes List', 'GET', '/quizzes');
    const quizData = await assertEndpoint('Quiz for Research', 'GET', `/quizzes/research/${sampleResearchId}`);
    const sampleQuizId = quizData?.quiz?._id;
    if (sampleQuizId) {
      await assertEndpoint('Complete Quiz', 'POST', `/quizzes/${sampleQuizId}/complete`, {
        answers: ['A', 'B']
      }, {}, (data) => {
        if (typeof data.score !== 'number' || !Array.isArray(data.diagnosticFeedback)) {
          throw new Error('Quiz completion feedback missing');
        }
      });
    }

    // 14. Student Progress
    await assertEndpoint('Student Learning Progress', 'GET', '/progress', null, {}, (data) => {
      if (!data.progress || typeof data.progress.xp !== 'number') {
        throw new Error('Progress record invalid');
      }
    });

    // 15. Outreach Generation & List
    await assertEndpoint('Outreach Story Generation', 'POST', '/outreach/generate', {
      researchResource: sampleResearchId,
      format: 'Instagram Post'
    }, {}, (data) => {
      if (!data.content) throw new Error('Missing generated outreach content');
    });

    await assertEndpoint('Outreach Saved Drafts', 'GET', '/outreach');

    // 16. Admin Dashboard & Records
    await assertEndpoint('Admin Directorate Dashboard', 'GET', '/admin/dashboard', null, {}, (data) => {
      if (!data.metrics || typeof data.metrics.resources !== 'number') {
        throw new Error('Admin metrics missing');
      }
    });

    await assertEndpoint('Admin Resources List', 'GET', '/admin/resources');

    // 17. Scholar Profile
    await assertEndpoint('Scholar Profile', 'GET', '/profile', null, {}, (data) => {
      if (!data.user || !data.accreditation?.registryId) {
        throw new Error('Scholar profile missing accreditation or user identity');
      }
    });

  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n----------------------------------------');
  console.log(`TOTAL ENDPOINTS TESTED : ${totalTests}`);
  console.log(`PASSED                 : ${passedTests}`);
  console.log(`FAILED                 : ${failedTests}`);
  console.log('----------------------------------------\n');

  if (failedTests > 0) {
    console.error('✘ Smoke tests failed.');
    process.exit(1);
  } else {
    console.log('✔ All API smoke tests passed with 100% success rate!\n');
    process.exit(0);
  }
}

if (require.main === module) {
  runSmokeTests().catch((err) => {
    console.error('Fatal smoke test runner error:', err);
    process.exit(1);
  });
}

module.exports = { runSmokeTests };
