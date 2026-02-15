import { fetchFromApi } from '../../lib/api'; // Pastikan path folder-nya benar

export default async function handler(req, res) {
  const { action, page, q, detailPath } = req.query;
  
  try {
    const data = await fetchFromApi(action, { page, q, detailPath });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}