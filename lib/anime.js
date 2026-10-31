const ANILIST = 'https://graphql.anilist.co';
const HI = 'https://hianime.at';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36';

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'user-agent': UA, accept: 'application/json,text/html,*/*', ...(options.headers || {}) },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
  return response;
}
function clean(value = '') { return value.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(); }
function blocked(value = '') { return /hentai|adult anime/i.test(value); }
function normalizeAni(item) {
  const title = item.title?.english || item.title?.romaji || item.title?.native || 'Untitled';
  return { id: String(item.id), kind: 'anime', title, poster: item.coverImage?.extraLarge || item.coverImage?.large || item.coverImage?.medium || '', year: item.seasonYear || item.startDate?.year || '', rating: item.averageScore ? (item.averageScore / 10).toFixed(1) : '', type: item.format || 'ANIME', synopsis: clean(item.description || ''), genres: item.genres || [], episodes: item.episodes || null, status: item.status || '', detailPath: String(item.id), anilistId: item.id };
}
async function anilist(query, variables = {}) {
  const response = await request(ANILIST, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, variables }) });
  const data = await response.json();
  if (data.errors?.length) throw new Error(data.errors[0].message);
  return data.data;
}
const MEDIA_FIELDS = 'id idMal title { romaji english native } format episodes averageScore seasonYear status genres description(asHtml:false) coverImage { extraLarge large medium } startDate { year } nextAiringEpisode { episode airingAt }';
export async function animeCatalog(page = 1, mode = 'popular') {
  const query = `query($page:Int){ Page(page:$page,perPage:24){ pageInfo { hasNextPage lastPage } media(type:ANIME, sort: ${mode === 'trending' ? 'TRENDING_DESC' : 'POPULARITY_DESC'}) { ${MEDIA_FIELDS} } } }`;
  const data = await anilist(query, { page: Math.max(1, Number(page) || 1) });
  const p = data.Page;
  return { items: (p.media || []).filter(x => !blocked([x.title?.english,x.title?.romaji,...(x.genres||[])].join(' '))).map(normalizeAni), pageInfo: p.pageInfo };
}
export async function animeSearch(q, page = 1) {
  const query = `query($q:String,$page:Int){ Page(page:$page,perPage:24){ pageInfo { hasNextPage lastPage } media(search:$q,type:ANIME,sort:SEARCH_MATCH){ ${MEDIA_FIELDS} } } }`;
  const data = await anilist(query, { q, page: Math.max(1, Number(page) || 1) });
  const p = data.Page;
  const meta = (p.media || []).filter(x => !blocked([x.title?.english,x.title?.romaji,...(x.genres||[])].join(' '))).map(normalizeAni);
  let streams = [];
  try { streams = await hianimeSearch(q, page); } catch {}
  const byTitle = new Map(streams.map(x => [x.title.toLowerCase(), x]));
  return { items: meta.map(x => { const hit = byTitle.get(x.title.toLowerCase()) || streams.find(s => s.title.toLowerCase().includes(x.title.toLowerCase()) || x.title.toLowerCase().includes(s.title.toLowerCase())); return { ...x, streamSlug: hit?.id || '' }; }), pageInfo: p.pageInfo };
}
export async function hianimeSearch(q, page = 1) {
  if (!q || blocked(q)) return [];
  const html = await (await request(`${HI}/search?keyword=${encodeURIComponent(q)}&page=${page}`)).text();
  const cards = [];
  const blocks = html.split('flw-item').slice(1);
  for (const block of blocks) {
    const slug = block.match(/film-name[^>]*>[\s\S]*?<a[^>]*href=["'][^"']*\/([^/"']+)["']/i)?.[1];
    const title = block.match(/film-name[^>]*>[\s\S]*?<a[^>]*title=["']([^"']+)/i)?.[1];
    const poster = block.match(/film-poster-img[^>]*?(?:data-src|src)=["']([^"']+)/i)?.[1] || '';
    if (slug && title && !blocked(title + slug)) cards.push({ id: slug, title: clean(title), poster, kind: 'anime' });
  }
  return cards;
}
export async function animeEpisodes(slug) {
  if (!slug || blocked(slug)) throw new Error('Anime tidak tersedia');
  const id = slug.match(/-(\d+)$/)?.[1];
  if (!id) throw new Error('Slug HiAnime tidak valid');
  const payload = await (await request(`${HI}/api/theme/episode/list/${id}`, { headers: { referer: HI + '/' } })).json();
  const html = payload.html || '';
  const episodes = [];
  for (const match of html.matchAll(/data-number="(\d+(?:\.\d+)?)"[^>]*?data-id="(\d+)"/g)) episodes.push({ episode: Number(match[1]), id: match[2] });
  const unique = [...new Map(episodes.map(e => [e.episode, e])).values()].sort((a,b) => a.episode-b.episode);
  return unique;
}
export async function animeDetail(id) {
  const query = `query($id:Int){ Media(id:$id,type:ANIME){ ${MEDIA_FIELDS} staff(perPage:8){ edges { role node { name { full } } } } studios(isMain:true){ nodes { name } } } }`;
  const data = await anilist(query, { id: Number(id) });
  if (!data.Media) throw new Error('Anime tidak ditemukan');
  const meta = normalizeAni(data.Media);
  let streams = [];
  try { streams = await hianimeSearch(meta.title, 1); } catch {}
  const hit = streams[0];
  let episodes = [];
  if (hit?.id) { try { episodes = await animeEpisodes(hit.id); } catch {} }
  return { ...meta, streamSlug: hit?.id || '', episodes, staff: data.Media.staff?.edges || [], studios: data.Media.studios?.nodes || [] };
}
export async function resolveAnime(slug, episode, mode = 'sub') {
  const eps = await animeEpisodes(slug);
  const target = eps.find(e => e.episode === Number(episode));
  if (!target) throw new Error('Episode tidak ditemukan');
  const url = `${HI}/api/theme/episode/servers?episodeId=${target.id}`;
  const data = await (await request(url, { headers: { referer: HI + '/' } })).text();
  const html = data.replace(/\\\"/g, '"');
  const servers = [];
  for (const block of html.split('server-item').slice(1)) {
    if (!block.includes(`data-type="${mode === 'dub' ? 'dub' : 'sub'}"`)) continue;
    const hash = block.match(/data-hash="([^"]+)"/)?.[1];
    const name = block.match(/data-server-name="([^"]+)"/)?.[1] || 'Server';
    if (!hash) continue;
    try { const embed = Buffer.from(hash, 'base64').toString('utf8'); if (/^https?:\/\//.test(embed)) servers.push({ name, embed }); } catch {}
  }
  if (!servers.length) throw new Error('Server streaming tidak tersedia untuk episode ini');
  servers.sort((a,b) => Number(!/megaplay/i.test(a.name+a.embed))-Number(!/megaplay/i.test(b.name+b.embed)));
  return { episode: Number(episode), source: 'HiAnime', servers, embedUrl: servers[0].embed, subtitles: [] };
}
export async function animeSchedule() {
  const query = `query { Page(page:1,perPage:50){ airingSchedules(notYetAired:true,sort:TIME){ airingAt episode media { ${MEDIA_FIELDS} } } } }`;
  const data = await anilist(query);
  return (data.Page.airingSchedules || []).filter(x => x.media && !blocked(x.media.title?.english || '')).map(x => ({ ...normalizeAni(x.media), episode: x.episode, airingAt: x.airingAt }));
}
