import { Buffer } from 'buffer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { leaderboard } = req.body;
    if (!Array.isArray(leaderboard)) {
      return res.status(400).json({ error: 'Formato leaderboard non valido' });
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = 'Matteo-Tomadini123/snake-game';
    const path = 'leaderboard.json'; // Usa la root per semplicità
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    // Ottieni SHA del file
    const getRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fileData = await getRes.json();
    const sha = fileData.sha;

    // Prepara payload
    const payload = {
      message: 'Aggiorno classifica',
      content: Buffer.from(JSON.stringify(leaderboard, null, 2)).toString('base64'),
      sha
    };

    // Aggiorna file su GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await putRes.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
