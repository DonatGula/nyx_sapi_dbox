import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function DetailKomik() {
  const router = useRouter();
  const { id } = router.query;
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchChapter, setSearchChapter] = useState('');

  const [isBookmarked, setIsBookmarked] = useState(false);

  // 1. Fungsi Fetch Utama (Ditambahkan log untuk debugging paman)
  const fetchChapters = useCallback(async (page, order, query = '') => {
    if (!id) return;
    try {
      setLoading(true);
      // Pastikan URL API menggunakan format yang benar untuk filter chapter
      let url = `https://api.shngm.io/v1/chapter/${id}/list?page=${page}&page_size=${pageSize}&sort_by=chapter_number&sort_order=${order}`;
      
      // Jika ada query pencarian, tambahkan parameter q
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }
      
      const resChapters = await fetch(url);
      const dataChapters = await resChapters.json();
      setChapters(dataChapters.data || []);
    } catch (err) {
      console.error("Gagal memuat chapter", err);
    } finally {
      setLoading(false);
    }
  }, [id, pageSize]);

  // 2. Logic Pencarian (DEBOUNCE FIXED)
  useEffect(() => {
    if (!id) return;

    // Jika search kosong, langsung load normal
    if (!searchChapter) {
      fetchChapters(currentPage, sortOrder, '');
      return;
    }

    // Debounce: Tunggu user berhenti mengetik selama 500ms
    const timer = setTimeout(() => {
      fetchChapters(1, sortOrder, searchChapter);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchChapter, id, sortOrder, fetchChapters]); // Hapus currentPage dari sini agar tidak loop

  // 3. Load Detail Manga
  useEffect(() => {
    if (!id) return;
    const fetchMangaDetail = async () => {
      try {
        const resDetail = await fetch(`https://api.shngm.io/v1/manga/detail/${id}`);
        const dataDetail = await resDetail.json();
        setManga(dataDetail.data);
      } catch (err) { console.error(err); }
    };
    fetchMangaDetail();
  }, [id]);

  // Cek Bookmark
  useEffect(() => {
    if (!id) return;
    const bookmarks = JSON.parse(localStorage.getItem('nonton_yuk_bookmarks') || '[]');
    setIsBookmarked(bookmarks.some(item => item.id === id));
  }, [id]);

  const toggleBookmark = () => {
    if (!manga) return;
    const bookmarks = JSON.parse(localStorage.getItem('nonton_yuk_bookmarks') || '[]');
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(item => item.id !== id);
    } else {
      newBookmarks = [{ id, title: manga.title, cover: manga.cover_image_url, type: manga?.taxonomy?.Format?.[0]?.name || 'Manhwa' }, ...bookmarks];
    }
    localStorage.setItem('nonton_yuk_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handleChapterClick = (ch) => {
    if (!manga) return;
    const history = JSON.parse(localStorage.getItem('nonton_yuk_history') || '[]');
    const newHistory = [{ mangaId: id, chapterId: ch.chapter_id, chapterNum: ch.chapter_number, mangaTitle: manga.title, mangaCover: manga.cover_image_url, date: new Date() }, ...history.filter(item => item.mangaId !== id)].slice(0, 20);
    localStorage.setItem('nonton_yuk_history', JSON.stringify(newHistory));
    router.push(`/komik/reader/${ch.chapter_id}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchChapters(newPage, sortOrder, searchChapter);
    document.getElementById('chapter-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    setCurrentPage(1);
    fetchChapters(1, newOrder, searchChapter);
  };

  if (!manga && loading) return (
    <div className="bg-[#0a0a0d] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

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

      {/* Hero Section sama seperti sebelumnya */}
      <div className="relative pt-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none">
          <img src={manga?.cover_image_url} className="w-full h-full object-cover opacity-20 blur-3xl scale-150" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-64 flex-shrink-0 group">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <img src={manga?.cover_image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={manga?.title} />
                </div>
            </div>
            <div className="flex-1 pt-4">
                <div className="space-y-3 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{manga?.taxonomy?.Format?.[0]?.name || 'Manhwa'}</span>
                        <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 uppercase tracking-widest">{manga?.release_year} • {manga?.status === 1 ? 'ONGOING' : 'COMPLETED'}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">{manga?.title}</h1>
                    <p className="text-yellow-500 font-bold text-lg italic opacity-80">{manga?.taxonomy?.Author?.[0]?.name}</p>
                </div>
                <div className="max-w-2xl bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 italic">Synopsis</h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all duration-500 cursor-pointer">{manga?.description}</p>
                </div>
            </div>
        </div>
      </div>

      <div id="chapter-list" className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-[#16161e]/40 border border-white/5 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-yellow-500 rounded-full shadow-[0_0_15px_#ea7e08]"></div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Chapter List</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* SEARCH FIXED: Gunakan onChange untuk update state saja */}
              <div className="relative flex-1 lg:w-48">
                <input 
                  type="number"
                  placeholder="Cari Ch..."
                  value={searchChapter}
                  onChange={(e) => setSearchChapter(e.target.value)}
                  className="w-full bg-[#0a0a0d] border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold focus:border-yellow-500 outline-none transition-all"
                />
              </div>
              <button onClick={toggleSort} className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">
                {sortOrder === 'desc' ? 'Terbaru ↓' : 'Terlama ↑'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative min-h-[300px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#16161e]/60 backdrop-blur-sm z-20 rounded-3xl">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            {chapters.length > 0 ? chapters.map((ch) => (
              <button key={ch.chapter_id} onClick={() => handleChapterClick(ch)} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-[#0a0a0d] border border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/[0.03] group transition-all duration-300 text-left">
                <div>
                  <span className="text-sm font-black group-hover:text-yellow-500 transition-colors uppercase italic">Chapter {ch.chapter_number}</span>
                  <p className="text-[10px] font-bold text-gray-600 uppercase mt-1">Update: {new Date(ch.release_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>
            )) : (
              <div className="col-span-full py-24 text-center">
                <p className="text-gray-600 font-black text-sm uppercase italic opacity-50">Tidak ditemukan</p>
                {searchChapter && <button onClick={() => setSearchChapter('')} className="mt-4 text-xs text-yellow-500 font-black uppercase underline">Reset</button>}
              </div>
            )}
          </div>

          {!searchChapter && chapters.length > 0 && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <button disabled={currentPage === 1 || loading} onClick={() => handlePageChange(currentPage - 1)} className="px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-yellow-500 transition-all">← Prev</button>
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-yellow-500 font-black text-xl text-yellow-500 italic shadow-[5px_5px_0px_#ea7e08] -rotate-3">{currentPage}</div>
              <button disabled={chapters.length < pageSize || loading} onClick={() => handlePageChange(currentPage + 1)} className="px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-yellow-500 transition-all">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
