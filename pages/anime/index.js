import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AnimeHome() {
  const [tab, setTab] = useState('popular');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(nextPage = 1, append = false) {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ action: query.trim() ? 'search' : tab, page: String(nextPage) });
      if (query.trim()) params.set('q', query.trim());
      const response = await fetch('/api/anime?' + params);
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || 'Gagal memuat anime');
      const results = json.items || json.data?.items || [];
      setItems(old => append ? [...old, ...results] : results);
      setHasNext(Boolean(json.pageInfo?.hasNextPage));
      setPage(nextPage);
    } catch (e) { setError(e.message); if (!append) setItems([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (!query.trim()) load(1); }, [tab]);
  useEffect(() => { const timer = setTimeout(() => load(1), 450); return () => clearTimeout(timer); }, [query]);

  return <div className="min-h-screen bg-[#09090d] text-white">
    <Head><title>Anime | Nonton-Yuk</title><meta name="description" content="Jelajahi anime, cari judul, dan tonton episode." /></Head>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090d]/95 px-3 py-3 backdrop-blur sm:px-5 sm:py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-bold text-xl">Nonton<span className="text-pink-500">-Yuk</span></Link>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari anime..." className="order-3 w-full min-w-0 rounded-full border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-pink-500 sm:order-none sm:w-auto sm:max-w-lg sm:flex-1 sm:px-5" />
        <Link href="/" className="text-sm text-gray-300 hover:text-white">Film & Series</Link>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5 sm:py-8">
      <h1 className="mb-2 text-2xl font-black sm:text-3xl">Anime</h1>
      <p className="mb-6 text-sm text-gray-400">Metadata dari AniList, pencarian judul dan sumber episode dari HiAnime.</p>
      {!query && <div className="mb-7 flex gap-2">
        {['popular','trending'].map(x => <button key={x} onClick={() => setTab(x)} className={'rounded-full px-5 py-2 text-sm capitalize '+(tab===x?'bg-pink-600 text-white':'bg-white/10 text-gray-300')}>{x}</button>)}
      </div>}
      {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {loading && !items.length && <p className="py-16 text-center text-gray-400">Memuat anime...</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map(item => <Link key={item.id} href={'/anime/'+encodeURIComponent(item.id)} className="group overflow-hidden rounded-xl bg-white/5">
          <div className="aspect-[2/3] overflow-hidden bg-white/10"><img src={item.poster} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" /></div>
          <div className="p-2.5 sm:p-3"><h2 className="line-clamp-2 text-sm font-semibold">{item.title}</h2><p className="mt-1 text-xs text-gray-400">{item.year || 'Anime'} · {item.type}</p></div>
        </Link>)}
      </div>
      {!loading && hasNext && <div className="py-10 text-center"><button onClick={() => load(page+1,true)} className="rounded-full bg-white/10 px-6 py-3 hover:bg-white/20">Muat lebih banyak</button></div>}
      {!loading && !items.length && !error && <p className="py-16 text-center text-gray-500">Tidak ada hasil.</p>}
    </main>
  </div>;
}
