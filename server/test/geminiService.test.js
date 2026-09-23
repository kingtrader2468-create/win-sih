const test = require('node:test');
const assert = require('node:assert/strict');
const geminiService = require('../src/services/geminiService');

test('geminiService fallback returns structured prototype analysis without crashing', async () => {
  const dummyResource = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Antarctic Sea-Ice Thickness Dynamics',
    type: 'Research Paper',
    region: 'Antarctica',
    researchArea: 'Cryosphere',
    year: 2026,
    description: 'Field measurements of fast ice and pack ice thickness around Bharati station.',
    source: 'NCPOR / National Polar Data Centre'
  };

  const dummyFindings = [
    {
      _id: '507f1f77bcf86cd799439012',
      title: 'Pack ice thickness variation',
      description: 'Average thickness was recorded as 1.4m during winter campaign.',
      importance: 'high',
      evidenceLinks: ['507f1f77bcf86cd799439013']
    }
  ];

  const result = await geminiService.analyzeResource({
    resource: dummyResource,
    findings: dummyFindings,
    evidenceLinks: [],
    relatedResources: []
  });

  assert.ok(result);
  assert.equal(result.resourceId, dummyResource._id);
  assert.ok(result.summary);
  assert.ok(Array.isArray(result.keyFindings));
  assert.equal(result.keyFindings.length, 1);
  assert.equal(result.keyFindings[0].findingId, '507f1f77bcf86cd799439012');
  assert.ok(result.disclaimer.includes('authoritative') || result.disclaimer.includes('prototype'));
});

test('geminiService chatAboutResource fallback responds within context', async () => {
  const dummyResource = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Himalayan Glacier Mass Balance',
    region: 'Himalaya',
    researchArea: 'Glaciology',
    description: 'Stake measurements of Chhota Shigri glacier.'
  };

  const response = await geminiService.chatAboutResource({
    resource: dummyResource,
    findings: [],
    evidenceLinks: [],
    message: 'What dataset is connected to this finding?'
  });

  assert.ok(response);
  assert.ok(response.answer);
  assert.ok(response.disclaimer);
});

test('geminiService generateOutreachContent creates source-grounded draft', async () => {
  const dummyResource = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Ny-Ålesund Atmospheric Aerosol Monitoring',
    region: 'Arctic',
    researchArea: 'Atmosphere',
    year: 2026,
    source: 'MoES / NCPOR Himadri Station'
  };

  const dummyEvidence = [
    {
      _id: '507f1f77bcf86cd799439014',
      dataset: { title: 'Arctic Black Carbon Timeseries', variables: ['BC concentration'] }
    }
  ];

  const result = await geminiService.generateOutreachContent({
    resource: dummyResource,
    findings: [],
    evidenceLinks: dummyEvidence,
    format: 'Instagram Post'
  });

  assert.ok(result);
  assert.ok(result.content);
  assert.ok(result.sourceLabel.includes(dummyResource.title));
  assert.ok(result.content.includes('Ny-Ålesund Atmospheric Aerosol Monitoring') || result.content.includes('Polar Science in Focus'));
});
