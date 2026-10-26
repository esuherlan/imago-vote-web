const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const PREFIX = `${BASE}/voteapi/v1/public/votes`;

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${PREFIX}${path}`, options);
  } catch {
    throw new ApiError(0, 'network', 'Unable to connect to the server');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.code || 'error', json.message || 'Something went wrong');
  return json.data;
}

export const getVote = (code, voterToken) =>
  request(`/${encodeURIComponent(code)}`, { headers: { 'x-voter-token': voterToken } });

export const castBallot = (code, body) =>
  request(`/${encodeURIComponent(code)}/ballots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
