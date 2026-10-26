const KEY = 'imago-vote-token';
let memoryToken = null;

// getRandomValues also works outside secure contexts (http://<LAN-IP>), unlike crypto.randomUUID.
const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

export function getVoterToken() {
  try {
    let token = localStorage.getItem(KEY);
    if (!token) {
      token = randomToken();
      localStorage.setItem(KEY, token);
    }
    return token;
  } catch {
    if (!memoryToken) memoryToken = randomToken();
    return memoryToken;
  }
}
