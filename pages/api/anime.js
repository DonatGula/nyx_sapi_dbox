import { animeCatalog, animeSearch, animeDetail, animeEpisodes, resolveAnime, animeSchedule } from '../../lib/anime';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const { action = 'popular', q = '', page = '1', id = '', slug = '', ep = '1', mode = 'sub' } = req.query;
  try {
    let data;
    switch (action) {
      case 'search': data = await animeSearch(String(q), Number(page)); break;
      case 'popular':
      case 'trending':
      case 'browse': data = await animeCatalog(Number(page), action === 'trending' ? 'trending' : 'popular'); break;
      case 'schedule': data = await animeSchedule(); break;
      case 'detail': data = await animeDetail(String(id || slug)); break;
      case 'episodes': data = await animeEpisodes(String(slug)); break;
      case 'resolve': data = await resolveAnime(String(slug), Number(ep), String(mode)); break;
      default: return res.status(400).json({ success: false, error: 'Unknown anime action' });
    }
    return res.status(200).json({ success: true, ...((data && data.items) ? data : { data }) });
  } catch (error) {
    return res.status(502).json({ success: false, error: error.message || 'Anime source unavailable' });
  }
}
