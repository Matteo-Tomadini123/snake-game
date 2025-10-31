export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const { leaderboard } = req.body;
  const token = process.env.GITHUB_TOKEN; // Sicuro, non nel client
  const repo = 'Matteo-Tomadini123/snake-game';
  const path = 'leaderboard.json';

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  // Ottieni SHA del file
  const getRes = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const fileData = await getRes.json();
  const sha = fileData.sha;

  const payload = {
    message: 'Aggiorno classifica',
    content: Buffer.from(JSON.stringify(leaderboard, null, 2)).toString('base64'),
    sha: sha
  };

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
}
