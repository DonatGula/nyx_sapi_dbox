const BASE = 'https://api.themoviedb.org/3';
const ALLOWED = new Set(['trending/movie/week','movie/popular','movie/top_rated','movie/now_playing','search/movie']);
export default async function handler(req,res) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) return res.status(503).json({ error: 'TMDB_READ_ACCESS_TOKEN belum dikonfigurasi.' });
  const { action='trending/movie/week', page='1', q='' } = req.query;
  if (!ALLOWED.has(action)) return res.status(400).json({ error: 'Endpoint tidak diizinkan.' });
  if (action === 'search/movie' && !String(q).trim()) return res.status(400).json({ error: 'Kata pencarian wajib diisi.' });
  const url = new URL(`${BASE}/${action}`);
  url.searchParams.set('language','id-ID'); url.searchParams.set('page',String(Math.max(1,Math.min(500,Number(page)||1))));
  if (action === 'search/movie') url.searchParams.set('query',String(q).slice(0,120));
  try {
    const upstream = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}`, Accept:'application/json' } });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data.status_message || 'TMDB request gagal.' });
    return res.status(200).json(data);
  } catch { return res.status(502).json({ error:'TMDB tidak dapat dijangkau.' }); }
}
