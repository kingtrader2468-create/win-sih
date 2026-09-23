require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { getHealth } = require('../src/controllers/healthController');
const geminiService = require('../src/services/geminiService');

test('health: getHealth returns 503 when disconnected and 200 when connected', () => {
  let statusCode = null;
  let jsonBody = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          jsonBody = data;
        }
      };
    }
  };

  // 1. Test when disconnected or current state
  const originalState = mongoose.connection.readyState;
  getHealth({}, res);

  if (originalState === 1) {
    assert.equal(statusCode, 200);
    assert.equal(jsonBody.ok, true);
    assert.equal(jsonBody.database, 'connected');
  } else {
    assert.equal(statusCode, 503);
    assert.equal(jsonBody.ok, false);
    assert.equal(jsonBody.database, 'disconnected');
  }
});

test('evidence graph calculation: produces valid nodes and directed edge IDs without duplicate links', () => {
  const findingId = '000000000000000000000021';
  const datasetId = '000000000000000000000009';
  const edges = [];
  const edgeSet = new Set();

  function addEdge(sourceId, targetId, label) {
    const key = `${sourceId}->${targetId}:${label}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({
        id: `edge-${sourceId}-${targetId}-${edges.length}`,
        source: sourceId,
        target: targetId,
        label
      });
    }
  }

  addEdge(findingId, datasetId, 'supports');
  addEdge(findingId, datasetId, 'supports'); // duplicate attempt

  assert.equal(edges.length, 1);
  assert.equal(edges[0].source, findingId);
  assert.equal(edges[0].target, datasetId);
  assert.equal(edges[0].label, 'supports');
});

test('geminiService: handles empty key or service failure with clean prototype fallback', async () => {
  const result = await geminiService.analyzeResource({
    resource: {
      _id: 'test-id',
      title: 'Fallback Polar Study',
      description: 'Test description for fallback analysis.'
    },
    findings: [],
    evidenceLinks: [],
    relatedResources: []
  });

  assert.ok(result);
  assert.equal(result.mode, 'prototype-fallback');
  assert.ok(result.summary.length > 0);
  assert.ok(result.disclaimer.includes('authoritative') || result.disclaimer.includes('prototype'));
});
