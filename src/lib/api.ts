import { BinData } from '../types';

const API_KEY = '$2a$10$Zwr/q5r0c.Lv/6Ikq9a.ROrJruWGsHzf8uSI/HWq7yjG.4OrsE2O6';
const BASE_URL = 'https://api.jsonbin.io/v3/b';

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchBin(binId: string): Promise<BinData> {
  const response = await fetch(`${BASE_URL}/${binId}/latest`, {
    headers: {
      'X-Master-Key': API_KEY,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch bin');
  const data = await response.json();
  return data.record;
}

export async function updateBin(binId: string, data: BinData): Promise<void> {
  const response = await fetch(`${BASE_URL}/${binId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update bin');
}
