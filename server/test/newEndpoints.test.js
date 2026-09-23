const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getMapStations,
  getMapLayers,
  getMapProjects,
  getStationByCode
} = require('../src/controllers/mapController');
const {
  submitContactMessage
} = require('../src/controllers/contactController');

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

test('map: getMapStations returns 6 polar stations with telemetry', async () => {
  const req = {};
  const res = createMockRes();

  await getMapStations(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.stations.length >= 6);

  const bharati = res.body.stations.find((s) => s.code === 'BHARATI');
  assert.ok(bharati);
  assert.equal(bharati.region, 'Antarctica');
  assert.ok(bharati.currentWeather.temperature !== undefined);
  assert.ok(bharati.coordinates.latitude !== undefined);
});

test('map: getMapLayers returns climate, ocean, ice, temperature, and atmosphere layers', async () => {
  const req = { query: {} };
  const res = createMockRes();

  await getMapLayers(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.layers.climate);
  assert.ok(res.body.layers.ocean);
  assert.ok(res.body.layers.ice);
  assert.ok(res.body.layers.temperature);
  assert.ok(res.body.layers.atmosphere);
});

test('map: getMapProjects returns polar research campaigns', async () => {
  const req = { query: {} };
  const res = createMockRes();

  await getMapProjects(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.projects.length >= 4);
});

test('map: getStationByCode returns specific station data or 404', async () => {
  const reqValid = { params: { code: 'HIMADRI' } };
  const resValid = createMockRes();
  await getStationByCode(reqValid, resValid);
  assert.equal(resValid.statusCode, 200);
  assert.equal(resValid.body.station.code, 'HIMADRI');

  const reqInvalid = { params: { code: 'UNKNOWN_99' } };
  const resInvalid = createMockRes();
  await getStationByCode(reqInvalid, resInvalid);
  assert.equal(resInvalid.statusCode, 404);
});

test('contact: submitContactMessage validates required fields', async () => {
  const req = { body: {} };
  const res = createMockRes();

  await submitContactMessage(req, res);

  assert.equal(res.statusCode, 400);
  assert.ok(res.body.error);
});
