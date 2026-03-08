import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function DetailKomik() {
  const router = useRouter();
  const { id } = router.query;
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
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
        <title>{manga?.title} - N-Studio</title>
        <meta name="referrer" content="no-referrer" />
      </Head>

      {/* HEADER NAV */}
      <nav className="fixed top-0 w-full z-[70] bg-[#0a0a0d]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50 truncate max-w-[200px]">{manga?.title}</span>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-20 overflow-hidden">
        {/* Blur Background */}
        <div className="absolute top-0 inset-x-0 h-[400px] pointer-events-none">
          <img src={manga?.cover_image_url} className="w-full h-full object-cover opacity-20 blur-3xl scale-150" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 lg:gap-12">
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
            </div>
          </div>
        </div>
      </div>

      {/* CHAPTER SECTION */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="bg-[#16161e]/40 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Chapter List</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
              {chapters.length} Episodes
            </span>
          </div>

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
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #ea7e08; }
      `}</style>
    </div>
  );
}