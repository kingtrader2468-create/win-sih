const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getAuthHeaders(existingHeaders = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polar_auth_token') : null;
  const headers = { ...existingHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function getHealth() {
  const response = await fetch(`${apiBaseUrl}/health`);
  if (!response.ok) throw new Error('Unable to reach Polar India Hub API.');
  return response.json();
}

/* ---------------- Auth API ---------------- */

export async function loginUser(email, password) {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Login failed.');
  return data;
}

export async function registerUser(name, email, password, role, confirmPassword) {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, confirmPassword })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Registration failed.');
  return data;
}

export async function requestRegisterOtp(payload) {
  const response = await fetch(`${apiBaseUrl}/auth/register-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Failed to dispatch verification code.');
  return data;
}

export async function verifyRegisterOtp(payload) {
  const response = await fetch(`${apiBaseUrl}/auth/register-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Verification failed.');
  return data;
}

export async function requestForgotPasswordOtp(email) {
  const response = await fetch(`${apiBaseUrl}/auth/forgot-password-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Failed to dispatch reset code.');
  return data;
}

export async function resetPasswordVerify(payload) {
  const response = await fetch(`${apiBaseUrl}/auth/reset-password-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Failed to reset password.');
  return data;
}

export async function googleAuthUser(credentialOrToken, profile) {
  const payload = typeof credentialOrToken === 'string'
    ? { credential: credentialOrToken, token: credentialOrToken, profile }
    : { ...credentialOrToken, profile };

  const response = await fetch(`${apiBaseUrl}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Google authentication failed.');
  return data;
}

export async function getAuthMe() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polar_auth_token') : null;
  if (!token) return null;
  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      localStorage.removeItem('polar_auth_token');
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

/* ---------------- Research & Evidence API ---------------- */

export async function getResearch(parameters = {}, signal) {
  const query = new URLSearchParams(Object.entries(parameters).filter(([, value]) => value !== '' && value !== undefined));
  const response = await fetch(`${apiBaseUrl}/research?${query}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load research resources.');
  return response.json();
}

export async function getResearchResource(id, signal) {
  const response = await fetch(`${apiBaseUrl}/research/${id}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load this research resource.');
  return response.json();
}

export async function analyzeResearch(id) {
  const response = await fetch(`${apiBaseUrl}/research/${id}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' })
  });
  if (!response.ok) throw new Error('Unable to analyze this research resource.');
  return response.json();
}

export async function chatAboutResearch(id, message) {
  const response = await fetch(`${apiBaseUrl}/research/${id}/chat`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw new Error('Unable to send this contextual question.');
  return response.json();
}

export async function getEvidenceGraph(findingId, signal) {
  const response = await fetch(`${apiBaseUrl}/evidence/${findingId}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load source evidence.');
  return response.json();
}

/* ---------------- Mystery Investigation API (Gated) ---------------- */

export async function getMystery(id, signal) {
  const resolvedId = id && id !== 'undefined' ? id : 'default';
  const response = await fetch(`${apiBaseUrl}/mysteries/${resolvedId}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load this optional mystery.');
  return response.json();
}

export async function saveMystery(id) {
  const response = await fetch(`${apiBaseUrl}/mysteries/${id}/save`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Unable to save this mystery.');
  }
  return response.json();
}

export async function submitMysteryAnswer(id, answer, clueIndex) {
  const response = await fetch(`${apiBaseUrl}/mysteries/${id}/answer`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ answer, clueIndex })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Unable to submit this answer.');
  }
  return response.json();
}

export async function getMysteryResult(id, signal) {
  const response = await fetch(`${apiBaseUrl}/mysteries/${id}/result`, {
    signal,
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Complete the evidence investigation before viewing the result.');
  }
  return response.json();
}

/* ---------------- Quizzes & Progress API ---------------- */

export async function getQuizForResearch(resourceId, signal) {
  const response = await fetch(`${apiBaseUrl}/quizzes/research/${resourceId}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('No quiz is available for this research resource.');
  return response.json();
}

export async function completeQuiz(quizId, answers) {
  const response = await fetch(`${apiBaseUrl}/quizzes/${quizId}/complete`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ answers })
  });
  if (!response.ok) throw new Error('Unable to save quiz progress.');
  return response.json();
}

export async function getProgress(signal) {
  const response = await fetch(`${apiBaseUrl}/progress`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load student progress.');
  return response.json();
}

export async function markResearchExplored(id) {
  await fetch(`${apiBaseUrl}/research/${id}/explore`, { method: 'POST', headers: getAuthHeaders() });
}

export async function markEvidenceInvestigated(id) {
  await fetch(`${apiBaseUrl}/evidence/${id}/investigate`, { method: 'POST', headers: getAuthHeaders() });
}

/* ---------------- Catalogs (100% Public Access) ---------------- */

export async function getCatalog(collection, parameters = {}, signal) {
  const query = new URLSearchParams(Object.entries(parameters).filter(([, value]) => value));
  const response = await fetch(`${apiBaseUrl}/${collection}?${query}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Unable to load ${collection}.`);
  return response.json();
}

export async function getCatalogItem(collection, id, signal) {
  const response = await fetch(`${apiBaseUrl}/${collection}/${id}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load this record.');
  return response.json();
}

/* ---------------- Outreach & Communication ---------------- */

export async function generateOutreach(payload) {
  const response = await fetch(`${apiBaseUrl}/outreach/generate`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Unable to generate outreach content.');
  }
  return response.json();
}

/* ---------------- Administration ---------------- */

export async function getAdminDashboard(signal) {
  const response = await fetch(`${apiBaseUrl}/admin/dashboard`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load the administration dashboard.');
  return response.json();
}

export async function getAdminRecords(entity, parameters = {}, signal) {
  const query = new URLSearchParams(Object.entries(parameters).filter(([, value]) => value !== '' && value !== undefined));
  const response = await fetch(`${apiBaseUrl}/admin/${entity}?${query}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load administrative records.');
  return response.json();
}

export async function updateAdminRecordStatus(entity, id, status) {
  const response = await fetch(`${apiBaseUrl}/admin/${entity}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Unable to update this record status.');
  return response.json();
}

/* ---------------- Dashboard & Profile ---------------- */

export async function getDashboard(signal) {
  const response = await fetch(`${apiBaseUrl}/dashboard`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load dashboard data.');
  return response.json();
}

export async function globalSearch(query, signal) {
  const response = await fetch(`${apiBaseUrl}/search?q=${encodeURIComponent(query)}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Search request failed.');
  return response.json();
}

export async function getProfile(signal) {
  const response = await fetch(`${apiBaseUrl}/profile`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load user profile.');
  return response.json();
}

/* ---------------- Polar Map API ---------------- */

export async function getMapStations(signal) {
  const response = await fetch(`${apiBaseUrl}/map/stations`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load polar research stations.');
  return response.json();
}

export async function getMapLayers(layer, signal) {
  const query = layer ? `?layer=${encodeURIComponent(layer)}` : '';
  const response = await fetch(`${apiBaseUrl}/map/layers${query}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load polar environmental layers.');
  return response.json();
}

export async function getMapProjects(region, signal) {
  const query = region ? `?region=${encodeURIComponent(region)}` : '';
  const response = await fetch(`${apiBaseUrl}/map/projects${query}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load polar projects.');
  return response.json();
}

export async function getStationByCode(code, signal) {
  const response = await fetch(`${apiBaseUrl}/map/stations/${encodeURIComponent(code)}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load station telemetry.');
  return response.json();
}

/* ---------------- Homepage & Live Telemetry API ---------------- */

export async function getHomepageData(signal) {
  const response = await fetch(`${apiBaseUrl}/homepage`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load dynamic homepage content.');
  return response.json();
}

/* ---------------- Contact Us API ---------------- */

export async function submitContact(payload) {
  const response = await fetch(`${apiBaseUrl}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Failed to submit inquiry.');
  return data;
}

/* ---------------- Media API ---------------- */

export async function getMediaCatalog(parameters = {}, signal) {
  const query = new URLSearchParams(Object.entries(parameters).filter(([, value]) => value !== '' && value !== undefined));
  const response = await fetch(`${apiBaseUrl}/media?${query}`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to load polar media catalog.');
  return response.json();
}

/* ---------------- Notifications API ---------------- */

export async function getNotifications(signal) {
  const response = await fetch(`${apiBaseUrl}/notifications`, { signal, headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Unable to fetch notifications.');
  return response.json();
}

export async function markNotificationRead(id) {
  const response = await fetch(`${apiBaseUrl}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' })
  });
  if (!response.ok) throw new Error('Failed to mark notification as read.');
  return response.json();
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${apiBaseUrl}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' })
  });
  if (!response.ok) throw new Error('Failed to mark all notifications as read.');
  return response.json();
}

