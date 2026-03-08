import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function DetailKomik() {
  const router = useRouter();
  const { id } = router.query;
  const [manga, setManga] = useState(null);
  const [allChapters, setAllChapters] = useState([]); // Master data
  const [displayChapters, setDisplayChapters] = useState([]); // Data yang muncul di layar
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [searchChapter, setSearchChapter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first
  const [readChapters, setReadChapters] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resDetail, resChapters] = await Promise.all([
            fetch(`https://api.shngm.io/v1/manga/detail/${id}`),
            fetch(`https://api.shngm.io/v1/chapter/${id}/list?page=1&page_size=100&sort_by=chapter_number&sort_order=desc`)
        ]);
        const dataDetail = await resDetail.json();
        const dataChapters = await resChapters.json();
        setManga(dataDetail.data);
        setChapters(dataChapters.data || []);
      } catch (err) {
        console.error("Gagal memuat data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const allRead = JSON.parse(localStorage.getItem('readChapters')) || {};
    setReadChapters(allRead[id] || []);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const bookmarks = JSON.parse(localStorage.getItem('mangaBookmarks')) || {};
    // Check if any chapter of this manga is bookmarked
    const hasBookmark = Object.values(bookmarks).some(b => b.mangaId == id);
    setIsBookmarked(hasBookmark);
  }, [id]);

  const toggleBookmark = () => {
    if (!manga || chapters.length === 0) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('mangaBookmarks')) || {};
    const existingBookmarkKey = Object.keys(bookmarks).find(key => bookmarks[key].mangaId == id);

    if (existingBookmarkKey) {
        delete bookmarks[existingBookmarkKey];
        setIsBookmarked(false);
    } else {
        // Bookmark the latest chapter (first in list because default sort is desc)
        const latestChapter = chapters[0];
        bookmarks[latestChapter.chapter_id] = {
            chapterId: latestChapter.chapter_id,
            chapterNumber: latestChapter.chapter_number,
            mangaTitle: manga.title,
            mangaCover: manga.cover_image_url,
            mangaId: manga.manga_id,
            timestamp: Date.now()
        };
        setIsBookmarked(true);
    }
    localStorage.setItem('mangaBookmarks', JSON.stringify(bookmarks));
  };

  const toggleRead = (e, chapterId) => {
    e.stopPropagation();
    const allRead = JSON.parse(localStorage.getItem('readChapters')) || {};
    const currentMangaRead = allRead[id] || [];
    
    const newMangaRead = currentMangaRead.includes(chapterId)
      ? currentMangaRead.filter(cid => cid !== chapterId)
      : [...currentMangaRead, chapterId];
    
    allRead[id] = newMangaRead;
    localStorage.setItem('readChapters', JSON.stringify(allRead));
    setReadChapters(newMangaRead);
  };

  const markAllAsRead = () => {
    if (window.confirm('Are you sure you want to mark all chapters as read?')) {
        const allRead = JSON.parse(localStorage.getItem('readChapters')) || {};
        const allChapterIds = chapters.map(ch => ch.chapter_id);
        
        allRead[id] = allChapterIds;
        localStorage.setItem('readChapters', JSON.stringify(allRead));
        setReadChapters(allChapterIds);
    }
  };

  if (loading) return (
=======
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchChapter, setSearchChapter] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 1. FETCH DATA UTAMA
  const fetchInitialData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Load Detail Manga
      const resManga = await fetch(`https://api.shngm.io/v1/manga/detail/${id}`);
      const dataManga = await resManga.json();
      setManga(dataManga.data);

      // Load Chapters (Ambil 100 data sekaligus biar pencarian lokal enak)
      const resCh = await fetch(`https://api.shngm.io/v1/chapter/${id}/list?page=1&page_size=100&sort_by=chapter_number&sort_order=${sortOrder}`);
      const dataCh = await resCh.json();
      setAllChapters(dataCh.data || []);
      setDisplayChapters(dataCh.data || []);
    } catch (err) {
      console.error("Gagal load data paman:", err);
    } finally {
      setLoading(false);
    }
  }, [id, sortOrder]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 2. LOGIKA PENCARIAN & FILTER (LOCAL FILTER)
  useEffect(() => {
    let filtered = [...allChapters];

    // Filter berdasarkan nomor chapter
    if (searchChapter) {
      filtered = filtered.filter(ch => 
        ch.chapter_number.toString().includes(searchChapter)
      );
    }

    setDisplayChapters(filtered);
  }, [searchChapter, allChapters]);

  // 3. BOOKMARK LOGIC
  useEffect(() => {
    if (!id) return;
    const bookmarks = JSON.parse(localStorage.getItem('nonton_yuk_bookmarks') || '[]');
    setIsBookmarked(bookmarks.some(item => item.id === id));
  }, [id]);

  const toggleBookmark = () => {
    if (!manga) return;
    const bookmarks = JSON.parse(localStorage.getItem('nonton_yuk_bookmarks') || '[]');
    let newBookmarks = isBookmarked 
      ? bookmarks.filter(item => item.id !== id)
      : [{ id, title: manga.title, cover: manga.cover_image_url, type: manga?.taxonomy?.Format?.[0]?.name || 'Manhwa' }, ...bookmarks];
    
    localStorage.setItem('nonton_yuk_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  // 4. CHAPTER CLICK & HISTORY
  const handleChapterClick = (ch) => {
    if (!manga) return;
    const history = JSON.parse(localStorage.getItem('nonton_yuk_history') || '[]');
    const newHistory = [{ 
      mangaId: id, chapterId: ch.chapter_id, chapterNum: ch.chapter_number, 
      mangaTitle: manga.title, mangaCover: manga.cover_image_url, date: new Date() 
    }, ...history.filter(item => item.mangaId !== id)].slice(0, 20);
    localStorage.setItem('nonton_yuk_history', JSON.stringify(newHistory));
    router.push(`/komik/reader/${ch.chapter_id}`);
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setCurrentPage(1);
  };

  if (!manga && loading) return (
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
    <div className="bg-[#0a0a0d] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Filter and Sort Chapters
  const filteredChapters = chapters
    .filter(ch => 
      ch.chapter_number.toString().includes(searchChapter) || 
      `Chapter ${ch.chapter_number}`.toLowerCase().includes(searchChapter.toLowerCase())
    )
    .sort((a, b) => sortOrder === 'desc' ? b.chapter_number - a.chapter_number : a.chapter_number - b.chapter_number);


  return (
    <div className="bg-[#0a0a0d] min-h-screen text-white pb-20 selection:bg-yellow-500">
      <Head>
        <title>{manga?.title} - Nonton-Yuk</title>
        <meta name="referrer" content="no-referrer" />
      </Head>

      <nav className="fixed top-0 w-full z-[70] bg-[#0a0a0d]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={toggleBookmark} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isBookmarked ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,126,8,0.4)]' : 'bg-white/5 text-white border border-white/10'}`}>
            {isBookmarked ? '🔖 Terpasang' : '📑 Bookmark'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none">
          <img src={manga?.cover_image_url} className="w-full h-full object-cover opacity-20 blur-3xl scale-150" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 lg:gap-12">
<<<<<<< HEAD
          {/* Cover Image */}
          <div className="w-full md:w-64 flex-shrink-0 group">
             <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto md:mx-0 max-w-[250px] md:max-w-none">
                <img src={manga?.cover_image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={manga?.title} />
             </div>
          </div>

          {/* Manga Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                  {manga?.taxonomy?.Format?.[0]?.name || 'Manhwa'}
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400">
                  {manga?.release_year} • {manga?.status === 1 ? 'ONGOING' : 'COMPLETED'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none">{manga?.title}</h1>
              <p className="text-yellow-500 font-bold text-sm tracking-wide italic">{manga?.taxonomy?.Author?.[0]?.name}</p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Synopsis</h3>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                  {manga?.description || 'No description available.'}
                </p>
              </div>

              <div>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {manga?.taxonomy?.Genre?.map(g => (
                    <span key={g.slug} className="text-[10px] font-bold border border-white/10 px-3 py-1 rounded-lg hover:border-yellow-500/50 hover:text-yellow-500 transition-all">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {chapters.length > 0 && (
                    <button 
                        onClick={() => router.push(`/komik/reader/${chapters[chapters.length - 1].chapter_id}`)}
                        className="px-6 py-3 bg-yellow-500 text-black font-black uppercase text-xs rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                    >
                        Start Reading
                    </button>
                )}
                {chapters.length > 0 && (
                    <button 
                        onClick={toggleBookmark}
                        className={`p-3 rounded-xl transition-colors ${isBookmarked ? 'bg-yellow-500 text-black' : 'bg-white/10 text-yellow-500 hover:bg-white/20'}`}
                    >
                        <svg className="w-6 h-6" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </button>
                )}
              </div>
=======
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <img src={manga?.cover_image_url} className="w-full h-full object-cover" alt={manga?.title} />
                </div>
            </div>
            <div className="flex-1 pt-4">
                <div className="space-y-3 mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase">{manga?.taxonomy?.Format?.[0]?.name || 'Manhwa'}</span>
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 uppercase">{manga?.status === 1 ? 'ONGOING' : 'COMPLETED'}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">{manga?.title}</h1>
                    <p className="text-yellow-500 font-bold text-lg italic opacity-80">{manga?.taxonomy?.Author?.[0]?.name}</p>
                </div>
                <div className="max-w-2xl bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 italic">Synopsis</h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all duration-500">{manga?.description || 'Tidak ada deskripsi.'}</p>
                </div>
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
            </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* CHAPTER SECTION */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="bg-[#16161e]/40 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Chapter List</h3>
=======
      <div id="chapter-list" className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-[#16161e]/40 border border-white/5 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-yellow-500 rounded-full shadow-[0_0_15px_#ea7e08]"></div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Chapter List</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-48">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="Cari Ch..."
                  value={searchChapter}
                  onChange={(e) => setSearchChapter(e.target.value)}
                  className="w-full bg-[#0a0a0d] border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold focus:border-yellow-500 outline-none transition-all text-white"
                />
              </div>
              <button onClick={toggleSort} className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">
                {sortOrder === 'desc' ? 'Terbaru ↓' : 'Terlama ↑'}
              </button>
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
            </div>
          </div>

<<<<<<< HEAD
          {/* Search & Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    placeholder="Cari Chapter..." 
                    className="w-full bg-[#0a0a0d] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-500/50 transition-colors"
                    value={searchChapter}
                    onChange={(e) => setSearchChapter(e.target.value)}
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <button 
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-3 bg-[#0a0a0d] border border-white/10 rounded-xl text-xs font-bold uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2 min-w-[140px]"
            >
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                <svg className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button 
                onClick={markAllAsRead}
                className="px-4 py-3 bg-[#0a0a0d] border border-white/10 rounded-xl text-xs font-bold uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2 min-w-[140px]"
            >
                Mark All Read
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredChapters.length > 0 ? filteredChapters.map((ch) => {
              const isRead = readChapters.includes(ch.chapter_id);
              return (
              <button 
                key={ch.chapter_id}
                onClick={() => router.push(`/komik/reader/${ch.chapter_id}`)}
                className={`flex items-center justify-between p-4 rounded-2xl border group transition-all text-left ${isRead ? 'bg-[#16161e]/60 border-white/5' : 'bg-[#0a0a0d] border-white/10 hover:border-yellow-500/30 hover:bg-yellow-500/[0.03]'}`}
              >
                <div>
                  <span className={`text-[15px] font-black transition-colors uppercase ${isRead ? 'text-gray-500' : 'text-white group-hover:text-yellow-500'}`}>Chapter {ch.chapter_number}</span>
                  <p className="text-[15px] font-bold uppercase mt-1 italic text-gray-500">Update: {new Date(ch.release_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div 
                    onClick={(e) => toggleRead(e, ch.chapter_id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 ${isRead ? 'text-green-500' : 'text-gray-600 hover:text-white'}`}
                    title={isRead ? "Mark as Unread" : "Mark as Read"}
                >
                    <svg className="w-4 h-4" fill={isRead ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
              </button>
            )}) : (
              <p className="col-span-full text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">No Chapters Found</p>
=======
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative min-h-[300px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#16161e]/60 backdrop-blur-sm z-20 rounded-3xl">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
            {displayChapters.length > 0 ? displayChapters.map((ch) => (
              <button key={ch.chapter_id} onClick={() => handleChapterClick(ch)} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-[#0a0a0d] border border-white/5 hover:border-yellow-500 transition-all group">
                <div>
                  <span className="text-sm font-black group-hover:text-yellow-500 uppercase italic">Chapter {ch.chapter_number}</span>
                  <p className="text-[10px] font-bold text-gray-600 uppercase mt-1 italic tracking-tighter">
                    {new Date(ch.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>
            )) : (
              <div className="col-span-full py-24 text-center">
                <p className="text-gray-600 font-black text-sm uppercase italic opacity-50">Chapter "{searchChapter}" Tidak Ditemukan</p>
              </div>
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
            )}
          </div>

          {/* Pagination hanya muncul jika tidak sedang mencari */}
          {!searchChapter && displayChapters.length >= pageSize && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <button disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(p => p - 1)} className="px-8 py-4 rounded-2xl font-black text-[11px] uppercase bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-yellow-500 hover:text-black transition-all">← Prev</button>
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-yellow-500 font-black text-xl text-yellow-500 italic shadow-[5px_5px_0px_#ea7e08]">{currentPage}</div>
              <button disabled={displayChapters.length < pageSize || loading} onClick={() => setCurrentPage(p => p + 1)} className="px-8 py-4 rounded-2xl font-black text-[11px] uppercase bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-yellow-500 hover:text-black transition-all">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
