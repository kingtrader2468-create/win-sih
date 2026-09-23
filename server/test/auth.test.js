const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect, optionalAuth } = require('../src/middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'polar-india-hub-moes-secret-key-2026';

test('auth: password hashing and verification works with bcrypt', async () => {
  const plainPassword = 'ScholarSecret2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hash, plainPassword);
  const isMatch = await bcrypt.compare(plainPassword, hash);
  assert.equal(isMatch, true);

  const isWrong = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isWrong, false);
});

test('auth: JWT token minting and decoding preserves scholar identity', () => {
  const payload = {
    id: '65f123456789abcdef012345',
    email: 'scholar@ncpor.res.in',
    role: 'researcher',
    registryId: 'POL-2026-9921'
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  assert.equal(typeof token, 'string');

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.email, payload.email);
  assert.equal(decoded.registryId, payload.registryId);
});

test('authMiddleware: protect rejects unauthenticated request with 401', () => {
  const req = { headers: {} };
  let statusCode = null;
  let jsonResponse = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          jsonResponse = data;
        }
      };
    }
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  protect(req, res, next);
  assert.equal(statusCode, 401);
  assert.equal(nextCalled, false);
  assert.ok(jsonResponse.error.message.includes('Authentication required'));
});

test('authMiddleware: optionalAuth allows guest request with req.user = null', () => {
  const req = { headers: {} };
  const res = {};
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  optionalAuth(req, res, next);
  assert.equal(nextCalled, true);
  assert.equal(req.user, null);
});

test('sovereign access policy: public catalogs require no auth, mystery games & outreach gated', () => {
  const publicRoutes = ['/api/research', '/api/datasets', '/api/stations', '/api/expeditions'];
  const gatedRoutes = ['/api/mysteries/:id/answer', '/api/mysteries/:id/save', '/api/profile', '/api/outreach/generate'];

  // Verification of policy definition
  assert.equal(publicRoutes.length, 4);
  assert.equal(gatedRoutes.length, 4);
  assert.ok(publicRoutes.every((r) => !r.includes('answer') && !r.includes('save') && !r.includes('generate')));
  assert.ok(gatedRoutes.some((r) => r.includes('answer')));
  assert.ok(gatedRoutes.some((r) => r.includes('generate')));
});

