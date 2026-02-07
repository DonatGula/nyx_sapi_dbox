// pages/api/anime.js
export default async function handler(req, res) {
  const { path } = req.query;
  const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  try {
    const response = await fetch(`https://air.vunime.my.id/mobinime/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': 'ThWmZq4t7w!z%C*F-JaNdRgUkXn2r5u8',
      },
      // Mengubah JSON kembali ke format x-www-form-urlencoded
      body: new URLSearchParams(bodyData).toString(),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy Error' });
  }
}
