export default async function handler(req, res) {
  const { path } = req.query;

  try {
    // Ubah body JSON dari frontend menjadi URLSearchParams agar dimengerti server pusat
    const bodyData = new URLSearchParams(
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ).toString();

    const response = await fetch(`https://air.vunime.my.id/mobinime/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': 'ThWmZq4t7w!z%C*F-JaNdRgUkXn2r5u8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36'
      },
      body: bodyData,
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("PROXY ERROR:", error);
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
}