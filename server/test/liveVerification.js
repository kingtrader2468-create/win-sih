const API_BASE = 'http://127.0.0.1:5000/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
}

async function runVerification() {
  console.log('--- STARTING POLAR INDIA HUB AUTH & ACCESS VERIFICATION ---\n');
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition, name, details = '') {
    totalTests++;
    if (condition) {
      console.log(`✔ [PASS] ${name}`);
      passedCount++;
    } else {
      console.error(`✖ [FAIL] ${name} - ${details}`);
    }
  }

  // 1. PUBLIC ACCESS VERIFICATION (NO LOGIN)
  console.log('[1] Testing Public Access without Login:');
  const resResearch = await fetchJson('/research');
  if (!resResearch.ok) console.log('DEBUG resResearch:', resResearch);
  assert(resResearch.ok && Array.isArray(resResearch.data.items), 'GET /api/research is 100% public', JSON.stringify(resResearch));

  const resDatasets = await fetchJson('/datasets');
  assert(resDatasets.ok && Array.isArray(resDatasets.data.items), 'GET /api/datasets is 100% public');

  const resStations = await fetchJson('/stations');
  assert(resStations.ok && Array.isArray(resStations.data.items), 'GET /api/stations is 100% public');

  const resExpeditions = await fetchJson('/expeditions');
  assert(resExpeditions.ok && Array.isArray(resExpeditions.data.items), 'GET /api/expeditions is 100% public');

  // 2. CONTINUE LEARNING GATED ON DASHBOARD FOR GUESTS
  console.log('\n[2] Testing Continue Learning Gating:');
  const resDashboardGuest = await fetchJson('/dashboard');
  assert(
    resDashboardGuest.ok && resDashboardGuest.data.userProgress === null,
    'GET /api/dashboard returns userProgress: null for unauthenticated guests (no continue learning shown)'
  );

  // 3. MYSTERY GAMES GATED WITHOUT LOGIN
  console.log('\n[3] Testing Mystery Game Gating without Login:');
  const firstResource = resResearch.data.items[0];
  const resourceId = firstResource._id;

  const resMysteryGuest = await fetchJson(`/mysteries/${resourceId}`);
  assert(
    resMysteryGuest.ok &&
    resMysteryGuest.data.isAuthenticated === false &&
    resMysteryGuest.data.mystery.locked === true &&
    resMysteryGuest.data.mystery.clues.length === 0,
    'GET /api/mysteries/:id returns locked clues for guests (cannot play without login)'
  );

  const resSaveGuest = await fetchJson(`/mysteries/${resourceId}/save`, { method: 'POST' });
  assert(resSaveGuest.status === 401, 'POST /api/mysteries/:id/save rejects unauthenticated guests with 401');

  const resAnswerGuest = await fetchJson(`/mysteries/${resourceId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer: 'Test', clueIndex: 0 })
  });
  assert(resAnswerGuest.status === 401, 'POST /api/mysteries/:id/answer rejects unauthenticated guests with 401');

  const resOutreachGuest = await fetchJson('/outreach/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ researchResource: resourceId, format: 'Instagram Post' })
  });
  assert(resOutreachGuest.status === 401, 'POST /api/outreach/generate rejects unauthenticated guests with 401');

  const resProfileGuest = await fetchJson('/profile');
  assert(resProfileGuest.status === 401, 'GET /api/profile rejects unauthenticated guests with 401');

  // 4. AUTHENTICATION & GOOGLE OAUTH
  console.log('\n[4] Testing Google OAuth and Scholar Authentication:');
  const googleDemoPayload = {
    profile: {
      email: 'dr.ananya.sharma@ncpor.res.in',
      name: 'Dr. Ananya Sharma',
      sub: 'google-oauth2-ncpor-live-verify',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
    }
  };

  const resGoogleAuth = await fetchJson('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googleDemoPayload)
  });

  assert(
    resGoogleAuth.ok &&
    typeof resGoogleAuth.data.token === 'string' &&
    resGoogleAuth.data.user.email === 'dr.ananya.sharma@ncpor.res.in' &&
    resGoogleAuth.data.user.registryId.startsWith('POL-2026-'),
    'POST /api/auth/google authenticates Google Scholar profile and issues signed JWT + POL-2026-XXXX ID'
  );

  const token = resGoogleAuth.data.token;
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 5. AUTHENTICATED ACCESS (PLAYING MYSTERIES & CONTINUE LEARNING)
  console.log('\n[5] Testing Authenticated Scholar Access:');
  const resAuthMe = await fetchJson('/auth/me', { headers: authHeaders });
  assert(resAuthMe.ok && resAuthMe.data.user.email === 'dr.ananya.sharma@ncpor.res.in', 'GET /api/auth/me returns scholar identity');

  const resAuthProfile = await fetchJson('/profile', { headers: authHeaders });
  assert(
    resAuthProfile.ok && resAuthProfile.data.user.registryId === resGoogleAuth.data.user.registryId,
    'GET /api/profile returns authenticated scholar profile and accreditation'
  );

  const resAuthDashboard = await fetchJson('/dashboard', { headers: authHeaders });
  assert(
    resAuthDashboard.ok && resAuthDashboard.data.userProgress !== null,
    'GET /api/dashboard returns personalized userProgress for authenticated scholar (continue learning enabled)'
  );

  const resAuthMystery = await fetchJson(`/mysteries/${resourceId}`, { headers: authHeaders });
  assert(
    resAuthMystery.ok &&
    resAuthMystery.data.isAuthenticated === true &&
    Array.isArray(resAuthMystery.data.mystery.clues) &&
    resAuthMystery.data.mystery.clues.length > 0,
    'GET /api/mysteries/:id unlocks full interactive clues for authenticated scholar (can play mystery)'
  );

  const resAuthOutreach = await fetchJson('/outreach/generate', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ researchResource: resourceId, format: 'Instagram Post' })
  });
  assert(
    resAuthOutreach.ok && resAuthOutreach.data.content && resAuthOutreach.data.content.format === 'Instagram Post',
    'POST /api/outreach/generate succeeds for authenticated scholar and creates draft'
  );

  console.log(`\n========================================`);
  console.log(`RESULT: ${passedCount}/${totalTests} TESTS PASSED`);
  console.log(`========================================\n`);

  process.exit(passedCount === totalTests ? 0 : 1);
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
