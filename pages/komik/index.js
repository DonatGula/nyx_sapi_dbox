import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CryptoJS from 'crypto-js';

export default function KomikHome() {
  const [mangaList, setMangaList]   = useState([]);
  const [topManga, setTopManga]     = useState([]);
  const [meta, setMeta]             = useState({});
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        setSearch(searchTerm); 
        setPage(1); 
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);
 
    useEffect(() => {
        setLoading(true);
        fetch(`https://api.shngm.io/v1/manga/list?page=${page}&page_size=24&sort=latest&q=${search}`)
        .then(res => res.json())
        .then(res => {
            setMangaList(res.data || []);
            setMeta(res.meta || {});
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [page, search]);

  
    useEffect(() => {
        fetch(`https://api.shngm.io/v1/manga/top?filter=all_time&page=1&page_size=10`)
        .then(res => res.json())
        .then(res => {
            setTopManga(res.data || []);
        })
        .catch(err => console.error("Gagal load Top Manga", err));
    }, []
);



  return (
    <div className="bg-[#0a0a0d] min-h-screen text-white font-sans selection:bg-yellow-500">
      <Head>
        <title>N-Studio Manga | Baca Manhwa Terlengkap</title>
        <meta name="referrer" content="no-referrer" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[60] bg-[#0a0a0d]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <Link href="/komik" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black group-hover:rotate-12 transition-transform">N</div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Manga</h1>
          </Link>
          
          <div className="relative flex-1 max-w-md group">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchTerm ? 'text-yellow-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
                type="text" 
                value={searchTerm}
                placeholder="Cari judul manhwa..." 
                className="w-full bg-white/5 border border-white/10 pl-11 pr-10 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Tombol Clear (X) kalau ada isinya */}
            {searchTerm && (
                <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                </button>
            )}
            </div>
            <div className="flex gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link href="/komik" className="hover:text-yellow-500 transition">Manga</Link>
             <Link href="/anime" className="text-white border-b-2 border-red-600">Home</Link>
             <Link href="/" className="hover:text-red-500 transition hidden sm:block">Movies</Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* SECTION TOP ALL TIME (Hanya muncul jika tidak sedang mencari) */}
        {!search && topManga.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
                <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                Top All Time
              </h3>
            </div>
            
            <div className="flex gap-5 overflow-x-auto pb-6 custom-scrollbar snap-x">
              {topManga.map((manga, idx) => (
                <Link href={`/komik/${manga.manga_id}`} key={manga.manga_id} className="snap-start shrink-0">
                  <div className="relative w-44 md:w-52 group">
                    {/* Ranking Badge */}
                    <div className="absolute -top-2 -left-2 z-20 w-10 h-10 bg-yellow-500 text-black flex items-center justify-center font-black rounded-xl rotate-[-10deg] shadow-xl group-hover:rotate-0 transition-transform text-lg">
                      {idx + 1}
                    </div>
                    
                    <div className="aspect-[3/4.5] rounded-3xl overflow-hidden border border-white/5 group-hover:border-yellow-500/50 transition-all duration-500 relative">
                      <img 
                        src={manga.cover_image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                        alt={manga.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent opacity-90"></div>
                      
                      {/* View Count Overlay */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                          {(manga.view_count / 1000000).toFixed(1)}M Views
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="mt-4 text-sm font-bold line-clamp-1 group-hover:text-yellow-500 transition-colors">
                      {manga.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION LATEST UPDATES */}
         <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              Latest Updates
            </h3>
          </div>
        <section>
            {search && <span className="text-xs text-gray-500 font-bold uppercase italic">Hasil pencarian: "{search}"</span>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
            {mangaList.map((manga) => (
              <Link href={`/komik/${manga.manga_id}`} key={manga.manga_id}>
                <div className="group relative bg-[#16161e]/40 rounded-2xl overflow-hidden cursor-pointer hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] transition-all duration-500 border border-white/5">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={manga.cover_image_url} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                      alt={manga.title}
                    />
                    
                    {/* Badge Manhwa/Manga */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg">
                        {manga.taxonomy?.Format?.[0]?.name || 'Manhwa'}
                      </span>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black text-yellow-500 uppercase">
                          Ch. {manga.latest_chapter_number}
                        </p>
                        <span className="text-[9px] text-white/40 font-bold italic">
                          {manga.release_year}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-[12px] font-bold leading-snug line-clamp-2 group-hover:text-yellow-500 transition-colors min-h-[32px]">
                      {manga.title}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section>
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-2xl uppercase tracking-tighter italic">
            {search ? `Hasil: ${search}` : 'Latest Updates'}
            </h3>
        </div>

        {mangaList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mangaList.map((manga) => (
                <Link href={`/komik/${manga.manga_id}`} key={manga.manga_id}>
                {/* ... Kartu Komik Paman ... */}
                </Link>
            ))}
            </div>
        ) : (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <p className="text-sm font-black uppercase tracking-[0.3em]">Komik "{search}" tidak ditemukan</p>
            <button onClick={() => setSearchTerm('')} className="mt-4 text-yellow-500 font-bold text-xs underline uppercase">Reset Pencarian</button>
            </div>
        )}
        </section>
        {/* PAGINATION */}
        <div className="mt-20 flex items-center justify-center gap-8">
          <button 
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); window.scrollTo(0,0); }}
            className="group flex items-center gap-2 p-2 disabled:opacity-20 transition-all"
          >
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.4em] mb-1">Page</span>
            <div className="text-2xl font-black text-yellow-500">
              {page} <span className="text-gray-800 mx-1">/</span> <span className="text-gray-600 text-lg">{meta.total_page || 1}</span>
            </div>
          </div>

          <button 
            disabled={page >= meta.total_page}
            onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
            className="group flex items-center gap-2 p-2 disabled:opacity-20 transition-all"
          >
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </button>
        </div>
      </main>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-[#0a0a0d]/90 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-500/20 rounded-full"></div>
            <div className="absolute top-0 w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-[11px] font-black tracking-[0.5em] text-yellow-500 animate-pulse">SYSTEM UPDATING...</p>
        </div>
      )}

      {/* CUSTOM CSS FOR SCROLLBAR */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ea7e08; border-radius: 10px; }
        .custom-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

    </div>
  );
}