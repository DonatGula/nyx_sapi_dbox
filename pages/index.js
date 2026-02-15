import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import MovieCard from '../components/MovieCard';

const TABS = [
  { id: 'trending', label: 'Trending' },
  { id: 'indonesian-movies', label: 'Indonesia' },
  { id: 'kdrama', label: 'K-Drama' },
  { id: 'anime', label: 'Anime' },
  { id: 'short-tv', label: 'Dracin' },
  { id: 'adult-comedy', label: 'Candaan Dewasa' },
  { id: 'western-tv', label: 'Western TV' },
  { id: 'indo-dub', label: 'Indo Dub' },
];

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async (action, pageNum = 1, query = '') => {
    setLoading(true);
    if (!query) setItems([]); 

    try {
      const url = `/api/movies?action=${action}&page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Error Load Data:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!search) {
      setCurrentPage(1);
      loadData(activeTab, 1);
    }
  }, [activeTab, search, loadData]);

  useEffect(() => {
    if (!search) return;
    const timer = setTimeout(() => {
      loadData('search', 1, search);
    }, 800);
    return () => clearTimeout(timer);
  }, [search, loadData]);

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-[#FF2D85] selection:text-white pb-20 ${isDark ? 'bg-[#050507] text-white/80' : 'bg-[#FDF2F8] text-slate-800'}`}>
      <Head>
        <title>Nonton-Yuk | Movie & Series</title>
      </Head>

      {/* STICKY NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-sm">
        <div className={`mx-auto flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border p-4 px-8 transition-all ${isDark ? 'bg-[#111114]/80 backdrop-blur-xl border-white/5' : 'bg-white/80 backdrop-blur-xl border-pink-100'}`}>
          <Link href="/" className="flex items-center gap-3 group">
  <div className={`p-2 rounded-xl transition-all duration-500 ${isDark ? 'bg-white/5' : 'bg-slate-900'}`}>
    <img 
      src="/logo/logo.webp" 
      alt="Nonton-Yuk Logo" 
      className={`h-9 w-auto object-contain transition-transform group-hover:scale-110 
        ${isDark 
          ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' 
          : 'drop-shadow-[2px_2px_0px_#FF2D85] filter invert-[0.1]' // Shadow pink kaku ala retro
        }`} 
    />
  </div>
  <h1 className={`text-xl font-black italic tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
    NONTON<span className="text-[#FF2D85]">-</span>YUK
  </h1>
</Link>
            
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button className={`p-2.5 rounded-2xl transition-all border-2 font-black text-[10px] uppercase ${isDark ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-white border-pink-100 text-slate-400'}`}>
               <a href='/komik' target='_blank' rel='noopener noreferrer'>📖 Manga</a>
            </button>
            <div className="relative w-full md:w-80 group">
                <input 
                type="text" 
                placeholder="Cari film disiniyaaa ......" 
                className={`w-full rounded-2xl px-5 py-2.5 text-sm outline-none transition-all border-2 ${isDark ? 'bg-white/5 border-transparent focus:border-pink-500' : 'bg-slate-100 border-transparent focus:border-pink-500'}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
            </div>
         
            <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2.5 rounded-2xl transition-all border-2 ${isDark ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-white border-pink-100 text-slate-400'}`}
            >
                {isDark ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-40 px-4 max-w-7xl mx-auto">
        
        {/* SCROLLABLE TAB SELECTOR */}
        {!search && (
          <div className="relative w-full overflow-hidden mb-12">
            <div className="flex gap-4 overflow-x-auto p-4 no-scrollbar scroll-smooth items-center px-2">
              {TABS.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 shrink-0 ${
                    activeTab === tab.id 
                    ? 'bg-[#FF2D85] border-black text-white shadow-[4px_4px_0px_#000] -translate-y-1' 
                    : isDark 
                      ? 'bg-[#1a1a1e] border-transparent text-white/30 hover:text-pink-500' 
                      : 'bg-white border-pink-100 text-slate-400 hover:text-[#FF2D85]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH STATUS */}
        {search && (
          <div className="mb-10 px-4">
            <h2 className={`text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              <span className="w-10 h-[2px] bg-[#FF2D85]"></span>
              Hasil Pencarian: <span className="text-[#FF2D85] italic">"{search}"</span>
            </h2>
          </div>
        )}

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {loading ? (
             [...Array(12)].map((_, i) => (
               <div key={i} className="space-y-4">
                  <div className={`aspect-[2/3] rounded-[1.5rem] animate-pulse border-4 ${isDark ? 'bg-[#16161a] border-white/5' : 'bg-white border-white shadow-xl'}`} />
                  <div className={`h-4 w-3/4 rounded animate-pulse mx-auto ${isDark ? 'bg-white/5' : 'bg-pink-100'}`} />
               </div>
             ))
          ) : items.length > 0 ? (
            items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="group">
                <MovieCard item={item} isDark={isDark} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-40 text-center">
              <p className="text-pink-500 font-black uppercase italic tracking-[0.5em] text-2xl opacity-20">Kosong Paman</p>
              <button 
                onClick={() => setSearch('')} 
                className="mt-8 px-10 py-4 bg-[#FF2D85] text-white rounded-2xl font-black shadow-[5px_5px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
              >
                BALIK KE BERANDA
              </button>
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        {!search && items.length > 0 && (
          <div className="mt-24 flex flex-col items-center gap-8">
            <div className="flex items-center gap-6">
              <button 
                disabled={currentPage === 1}
                onClick={() => {
                  const p = currentPage - 1;
                  setCurrentPage(p);
                  loadData(activeTab, p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase transition-all border-2 ${
                  currentPage === 1 
                  ? 'opacity-20 cursor-not-allowed border-slate-300' 
                  : 'bg-white border-black text-slate-900 shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none'
                }`}
              >
                ← Prev
              </button>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-[1.5rem] bg-[#FF2D85] border-2 border-black flex items-center justify-center text-white text-xl font-black shadow-[5px_5px_0px_#000] transform -rotate-3">
                  {currentPage}
                </div>
              </div>

              <button 
                onClick={() => {
                  const p = currentPage + 1;
                  setCurrentPage(p);
                  loadData(activeTab, p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3 rounded-2xl bg-white border-2 border-black text-slate-900 font-black text-[10px] uppercase shadow-[4px_4px_0px_#000] transition-all hover:translate-y-1 hover:shadow-none"
              >
                Next →
              </button>
            </div>
            <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
              Watching Page {currentPage}
            </p>
          </div>
        )}
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: ${isDark ? '#050507' : '#FDF2F8'}; transition: background-color 0.5s ease; }
      `}</style>
    </div>
  );
}