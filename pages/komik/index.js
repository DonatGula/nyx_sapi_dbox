import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function KomikHome() {
  const [mangaList, setMangaList]   = useState([]);
  const [topManga, setTopManga]     = useState([]);
  const [history, setHistory]       = useState([]); 
  const [bookmarks, setBookmarks]   = useState([]); 
  const [meta, setMeta]             = useState({});
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks]   = useState([]);
  const [mangaHistory, setMangaHistory] = useState([]);

<<<<<<< HEAD
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

    useEffect(() => {
        const storedBookmarks = JSON.parse(localStorage.getItem('mangaBookmarks')) || {};
        const sortedBookmarks = Object.values(storedBookmarks).sort((a, b) => b.timestamp - a.timestamp);
        setBookmarks(sortedBookmarks);
    }, []);

    useEffect(() => {
        const storedMangaHistory = JSON.parse(localStorage.getItem('mangaHistory')) || {};
        const sortedHistory = Object.values(storedMangaHistory).sort((a, b) => b.timestamp - a.timestamp);
        setMangaHistory(sortedHistory);
    }, []);


    const clearBookmarks = () => {
        if (window.confirm('Are you sure you want to clear all your bookmarks? This action cannot be undone.')) {
            localStorage.removeItem('mangaBookmarks');
            setBookmarks([]);
        }
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear your reading history? This action cannot be undone.')) {
            localStorage.removeItem('mangaHistory');
            setMangaHistory([]);
        }
    };
=======
  // 1. Ambil Data Local (History & Bookmark)
  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('nonton_yuk_history') || '[]');
    const b = JSON.parse(localStorage.getItem('nonton_yuk_bookmarks') || '[]');
    setHistory(h);
    setBookmarks(b);
  }, []);

  // 2. Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm); 
      setPage(1); 
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
 
  // 3. Fetch Manga List
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
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89

  // 4. Fetch Top Manga
  useEffect(() => {
    fetch(`https://api.shngm.io/v1/manga/top?filter=all_time&page=1&page_size=10`)
      .then(res => res.json())
      .then(res => setTopManga(res.data || []))
      .catch(err => console.error("Gagal load Top Manga", err));
  }, []);

  return (
    <div className="bg-[#0a0a0d] min-h-screen text-white font-sans selection:bg-yellow-500">
      <Head>
        <title>N-Studio Manga | Baca Manhwa Terlengkap</title>
        <meta name="referrer" content="no-referrer" />
      </Head>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[60] bg-[#0a0a0d]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <Link href="/komik" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.3)]">N</div>
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
                className="w-full bg-white/5 border border-white/10 pl-11 pr-10 py-3 rounded-2xl outline-none focus:border-yellow-500/50 text-sm transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">✕</button>
            )}
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link href="/" className="hover:text-yellow-500 transition hidden sm:block">BERANDA</Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
<<<<<<< HEAD

        {/* CONTINUE READING */}
        {!search && mangaHistory.length > 0 && (
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
                            <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                            Continue Reading
                        </h3>
                    </div>
                    <button onClick={clearHistory} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors">
                        Clear History
                    </button>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-6 custom-scrollbar snap-x">
                    {mangaHistory.map((item) => (
                        <Link href={`/komik/reader/${item.lastChapterId}`} key={item.mangaId} className="snap-start shrink-0">
                            <div className="w-36 sm:w-44 md:w-52 group">
                                <div className="aspect-[3/4.5] rounded-3xl overflow-hidden border border-white/5 group-hover:border-yellow-500/50 transition-all duration-500 relative">
                                    <img src={item.mangaCover} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.mangaTitle} />
                                </div>
                                <h4 className="mt-4 text-sm font-bold line-clamp-1 group-hover:text-yellow-500 transition-colors">{item.mangaTitle}</h4>
                                <p className="text-xs text-gray-400 font-semibold">Chapter {item.lastChapterNumber}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* BOOKMARKS */}
        {!search && bookmarks.length > 0 && (
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
                            <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                            Bookmarks
                        </h3>
                    </div>
                    <button onClick={clearBookmarks} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors">
                        Clear Bookmarks
                    </button>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-6 custom-scrollbar snap-x">
                    {bookmarks.map((b) => (
                        <Link href={`/komik/reader/${b.chapterId}`} key={b.chapterId} className="snap-start shrink-0">
                            <div className="w-36 sm:w-44 md:w-52 group">
                                <div className="aspect-[3/4.5] rounded-3xl overflow-hidden border border-white/5 group-hover:border-yellow-500/50 transition-all duration-500 relative">
                                    <img src={b.mangaCover} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={b.mangaTitle} />
                                </div>
                                <h4 className="mt-4 text-sm font-bold line-clamp-1 group-hover:text-yellow-500 transition-colors">{b.mangaTitle}</h4>
                                <p className="text-xs text-gray-400 font-semibold">Chapter {b.chapterNumber}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}

        {/* TOP ALL TIME */}
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
                <Link href={`/komik/${manga.manga_id}`} key={manga.manga_id} className="snap-start shrink-0 pl-2 pt-2">
                  <div className="relative w-36 sm:w-44 md:w-52 group">
                    {/* Ranking Badge */}
                    <div className="absolute -top-2 -left-2 z-20 w-10 h-10 bg-yellow-500 text-black flex items-center justify-center font-black rounded-xl rotate-[-10deg] shadow-xl group-hover:rotate-0 transition-transform text-lg">
                      {idx + 1}
=======
        
        {/* --- FITUR 1: LANJUT BACA (History) --- */}
        {!search && history.length > 0 && (
          <section className="mb-12 animate-in fade-in slide-in-from-left-5 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-yellow-500 rounded-full shadow-[0_0_10px_#ea7e08]"></div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Lanjut Baca</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {history.map((item, idx) => (
                <Link key={idx} href={`/komik/reader/${item.chapterId}`} className="shrink-0 w-64 bg-[#16161e] border border-white/5 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all flex h-24 group">
                  <div className="w-16 h-full shrink-0 overflow-hidden">
                    <img src={item.mangaCover} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="" />
                  </div>
                  <div className="p-3 flex flex-col justify-center min-w-0">
                    <h4 className="text-[11px] font-black uppercase italic truncate mb-1 group-hover:text-yellow-500">{item.mangaTitle}</h4>
                    <div className="flex items-center gap-2">
                        <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded italic">CH {item.chapterNum}</span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Terakhir dibaca</span>
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

<<<<<<< HEAD
        {/* SECTION LATEST UPDATES / SEARCH RESULTS */}
         <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              {search ? `Hasil: "${search}"` : 'Latest Updates'}
            </h3>
          </div>
        <section>
          {mangaList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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
          ) : (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <p className="text-sm font-black uppercase tracking-[0.3em]">Komik "{search}" Tidak Ditemukan</p>
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
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all group-disabled:border-white/5 group-disabled:bg-transparent">
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
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all group-disabled:border-white/5 group-disabled:bg-transparent">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
=======
        {/* --- FITUR 2: BOOKMARK (Koleksi) --- */}
        {!search && bookmarks.length > 0 && (
          <section className="mb-12 animate-in fade-in slide-in-from-left-5 duration-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-pink-500 rounded-full shadow-[0_0_10px_#ff2d85]"></div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Koleksi Saya</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {bookmarks.map((m) => (
                <Link key={m.id} href={`/komik/${m.id}`} className="shrink-0 w-28 group">
                  <div className="aspect-[3/4.2] rounded-2xl overflow-hidden border border-white/10 group-hover:border-pink-500/50 transition-all shadow-xl">
                    <img src={m.cover} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="" />
                  </div>
                  <h4 className="text-[10px] font-black mt-3 line-clamp-1 uppercase opacity-70 group-hover:text-pink-500 group-hover:opacity-100 transition-all italic tracking-tighter">{m.title}</h4>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION TOP ALL TIME */}
        {!search && topManga.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
                <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                Top All Time
              </h3>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
              {topManga.map((manga, idx) => (
                <Link href={`/komik/${manga.manga_id}`} key={manga.manga_id} className="shrink-0">
                  <div className="relative w-44 md:w-52 group">
                    <div className="absolute -top-2 -left-2 z-20 w-10 h-10 bg-yellow-500 text-black flex items-center justify-center font-black rounded-xl rotate-[-10deg] shadow-xl group-hover:rotate-0 transition-transform text-lg italic">
                      {idx + 1}
                    </div>
                    <div className="aspect-[3/4.5] rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-yellow-500/50 transition-all duration-500 relative">
                      <img src={manga.cover_image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={manga.title}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent opacity-90"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                         <h4 className="text-sm font-black line-clamp-2 uppercase italic tracking-tighter leading-tight">{manga.title}</h4>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION LATEST UPDATES / SEARCH RESULT */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
              <span className={`w-2 h-8 ${search ? 'bg-yellow-500' : 'bg-blue-600'} rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]`}></span>
              {search ? `Hasil: ${search}` : 'Latest Updates'}
            </h3>
          </div>

          {mangaList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-7">
              {mangaList.map((manga) => (
                <Link href={`/komik/${manga.manga_id}`} key={manga.manga_id}>
                  <div className="group relative bg-[#16161e]/40 rounded-[1.8rem] overflow-hidden cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 border border-white/5 hover:border-white/10">
                    <div className="relative aspect-[3/4.2] overflow-hidden">
                      <img src={manga.cover_image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={manga.title}/>
                      <div className="absolute top-3 left-3 flex gap-1">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase border border-white/10">
                          {manga.taxonomy?.Format?.[0]?.name || 'Manga'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/40 to-transparent p-4">
                        <p className="text-[10px] font-black text-yellow-500 uppercase italic tracking-widest drop-shadow-md">Chapter {manga.latest_chapter_number}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[#16161e]/60">
                      <h4 className="text-[11px] font-black leading-snug line-clamp-2 group-hover:text-yellow-500 transition-colors min-h-[32px] uppercase tracking-tighter italic">
                        {manga.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center opacity-40">
               <div className="w-20 h-20 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center mb-4">
                 <span className="text-2xl">🔍</span>
               </div>
               <p className="text-xs font-black uppercase tracking-[0.4em]">Kosong, coba cari yang lain paman</p>
               <button onClick={() => {setSearchTerm(''); setSearch('');}} className="mt-6 px-6 py-2 bg-white/5 rounded-xl text-yellow-500 font-black text-[10px] uppercase border border-white/5">Reset Pencarian</button>
            </div>
          )}
        </section>

        {/* PAGINATION */}
        {!loading && mangaList.length > 0 && (
          <div className="mt-24 flex items-center justify-center gap-10">
            <button 
                disabled={page === 1} 
                onClick={() => { setPage(p => p - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-10 group"
            >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Halaman</span>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-yellow-500 leading-none italic">{page}</span>
                <span className="text-gray-800 font-black text-lg">/ {meta.total_page || 1}</span>
              </div>
            </div>

            <button 
                disabled={page >= meta.total_page} 
                onClick={() => { setPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-10 group"
            >
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}
      </main>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-[#0a0a0d]/80 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(234,179,8,0.2)]"></div>
          <p className="mt-4 text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] animate-pulse italic">Memuat...</p>
        </div>
      )}

      <footer className="py-20 border-t border-white/5 flex flex-col items-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-widest">N-Studio Manga &copy; 2026</p>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: #0a0a0d; }
      `}</style>
    </div>
  );
}
