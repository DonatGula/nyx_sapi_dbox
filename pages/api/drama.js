import axios from 'axios';
import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
  const token = process.env.PLAYSVERSE_TOKEN;
  const secret = process.env.ENCRYPTION_KEY;

  try {
    const response = await axios.get('https://playsverse.com/api/playlet/drama/query', {
      params: { pageSize: 210, pageNum: 1, language: 'in' },
      headers: {
        'Authorization': token,
        'clientId': '8aaa2824912e16e799e82203b89668df',
        'User-Agent': 'okhttp/4.12.0'
      }
    });

    const rawData = JSON.stringify(response.data.rows);
    const encrypted = CryptoJS.AES.encrypt(rawData, secret).toString();

    res.status(200).json({ payload: encrypted });
  } catch (error) {
    res.status(500).json({ error: 'System Busy' });
  }
}
