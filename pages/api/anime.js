export default async function handler(req, res) {
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Path API tidak ditemukan' });
  }

  try {
    let bodyData = "";
    if (req.body) {
      const parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      bodyData = new URLSearchParams(parsedBody).toString();
    }

    // 3. Tembak ke Server Vunime
    const response = await fetch(`https://air.vunime.my.id/mobinime/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': 'ThWmZq4t7w!z%C*F-JaNdRgUkXn2r5u8', 
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36'
      },
      body: bodyData,
    });


    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error("Server Balikin Teks Bukan JSON:", responseText);
      return res.status(500).json({ error: 'Server pusat tidak mengirimkan data yang benar' });
    }

  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: 'Gagal koneksi ke server Vunime' });
  }
}