import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ReaderKomik() {
  const router = useRouter();
  const { chapterId } = router.query;
  const [chapter, setChapter] = useState(null);
  const [mangaDetail, setMangaDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // State untuk Auto Scroll
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);

  // 1. Fetch Data Chapter
  useEffect(() => {
    if (!chapterId) return;

    const fetchChapter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.shngm.io/v1/chapter/detail/${chapterId}`);
        const result = await res.json();
<<<<<<< HEAD
        
        // Simpan seluruh objek data
        const chapterData = result.data;
        setChapter(chapterData);

        // Check bookmark status
        const bookmarks = JSON.parse(localStorage.getItem('mangaBookmarks')) || {};
        if (bookmarks[chapterId]) {
            setIsBookmarked(true);
        }

        // Fetch manga detail for history
        if (chapterData?.manga_id) {
          const mangaRes = await fetch(`https://api.shngm.io/v1/manga/detail/${chapterData.manga_id}`);
          const mangaResult = await mangaRes.json();
          setMangaDetail(mangaResult.data);
        }
=======
        setChapter(result.data);
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
      } catch (err) {
        console.error("Gagal muat chapter", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
    window.scrollTo(0, 0);
    setIsScrolling(false);
  }, [chapterId]);

<<<<<<< HEAD
  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight' && chapter?.next_chapter_id) {
            router.push(`/komik/reader/${chapter.next_chapter_id}`);
        } else if (e.key === 'ArrowLeft' && chapter?.prev_chapter_id) {
            router.push(`/komik/reader/${chapter.prev_chapter_id}`);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapter, router]);

  // Save to History
  useEffect(() => {
    if (chapter && mangaDetail) {
      try {
        const history = JSON.parse(localStorage.getItem('mangaHistory')) || {};
        history[mangaDetail.manga_id] = {
          mangaId: mangaDetail.manga_id,
          mangaTitle: mangaDetail.title || chapter?.manga_title || 'Unknown Title',
          mangaCover: mangaDetail.cover_image_url || chapter?.manga_cover || '',
          lastChapterId: chapter.chapter_id,
          lastChapterNumber: chapter.chapter_number,
          timestamp: Date.now()
        };
        localStorage.setItem('mangaHistory', JSON.stringify(history));
      } catch (err) {
        console.error("Failed to save manga history", err);
      }
    }
  }, [chapter, mangaDetail]);

  // Mark as Read
  useEffect(() => {
    if (chapter?.manga_id && chapter?.chapter_id) {
        try {
            const allRead = JSON.parse(localStorage.getItem('readChapters')) || {};
            const currentMangaRead = allRead[chapter.manga_id] || [];
            
            if (!currentMangaRead.includes(chapter.chapter_id)) {
                const newMangaRead = [...currentMangaRead, chapter.chapter_id];
                allRead[chapter.manga_id] = newMangaRead;
                localStorage.setItem('readChapters', JSON.stringify(allRead));
            }
        } catch (e) {}
    }
  }, [chapter]);

  const toggleBookmark = () => {
    if (!chapter) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('mangaBookmarks')) || {};
    
    if (isBookmarked) {
        delete bookmarks[chapterId];
        setIsBookmarked(false);
    } else {
        bookmarks[chapterId] = {
            chapterId: chapterId,
            chapterNumber: chapter.chapter_number,
            mangaTitle: mangaDetail?.title || chapter.manga_title || 'Unknown Title', // Add manga title to bookmark
            mangaCover: mangaDetail?.cover_image_url || chapter.manga_cover || '', // Add manga cover to bookmark
            mangaId: chapter.manga_id,
            timestamp: Date.now()
        };
        setIsBookmarked(true);
    }
    localStorage.setItem('mangaBookmarks', JSON.stringify(bookmarks));
  };

  const handleReport = () => {
    window.open('https://t.me/nnyxx_0', '_blank', 'noopener,noreferrer');
  };
=======
  // 2. SIMPAN RIWAYAT (DIPERBAIKI AGAR SINKRON DENGAN HOME)
  useEffect(() => {
    if (chapter) {
      const history = JSON.parse(localStorage.getItem('nonton_yuk_history') || '[]');
      
      // Ambil Title & Cover dari response API chapter
      // Note: Pastikan key ini sesuai dengan response API paman
      const currentMangaTitle = chapter.manga_title || chapter.manga?.title || "Manga";
      const currentMangaCover = chapter.manga_cover_image_url || chapter.manga?.cover_image_url || "";

      const newEntry = { 
        mangaId: chapter.manga_id, 
        chapterId: chapter.chapter_id, 
        chapterNum: chapter.chapter_number,
        mangaTitle: currentMangaTitle, // Sesuai dengan Home
        mangaCover: currentMangaCover, // Sesuai dengan Home
        date: new Date() 
      };

      const newHistory = [
        newEntry,
        ...history.filter(item => item.mangaId !== chapter.manga_id)
      ].slice(0, 20);

      localStorage.setItem('nonton_yuk_history', JSON.stringify(newHistory));
    }
  }, [chapter]);

  // 3. Logika Auto Scroll
  useEffect(() => {
    let scrollInterval;
    if (isScrolling) {
      scrollInterval = setInterval(() => {
        window.scrollBy({
          top: scrollSpeed,
          behavior: 'auto'
        });
      }, 30);
    } else {
      clearInterval(scrollInterval);
    }
    return () => clearInterval(scrollInterval);
  }, [isScrolling, scrollSpeed]);
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white selection:bg-yellow-500">
      <Head>
<<<<<<< HEAD
        <title>{mangaDetail?.title} - Chapter {chapter?.chapter_number}</title>
=======
        <title>Chapter {chapter?.chapter_number} - {chapter?.manga_title}</title>
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
        <meta name="referrer" content="no-referrer" />
      </Head>

      {/* NAV TOP */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-[10px] font-black flex items-center gap-2 hover:text-yellow-500 transition-colors uppercase italic">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Kembali
        </button>
<<<<<<< HEAD
        <span className="text-sm font-black italic text-yellow-500">CHAPTER {chapter?.chapter_number}</span>
        <button onClick={toggleBookmark} className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-white'}`}>
            <svg className="w-6 h-6" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        </button>

        <div>
            {/* Tombol Chapter Selanjutnya */}
          {chapter?.next_chapter_id ? (
=======
        
        <div className="text-center">
            <h1 className="text-[10px] font-black text-gray-500 uppercase tracking-widest line-clamp-1 max-w-[120px] md:max-w-xs">
              {chapter?.manga_title || "Reading"}
            </h1>
            <p className="text-xs font-black italic text-yellow-500">CHAPTER {chapter?.chapter_number}</p>
        </div>

        <div className="flex items-center gap-3">
          {chapter?.next_chapter_id && (
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
            <Link href={`/komik/reader/${chapter.next_chapter_id}`}>
              <button className="px-4 md:px-6 py-2 bg-yellow-500 text-black rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-transform">
                Next →
              </button>
            </Link>
          )}
        </div>
      </nav>

<<<<<<< HEAD
      {/* IMAGE RENDERER */}
      <main className="pt-16 flex flex-col items-center">
        <div className="w-full max-w-3xl px-0 sm:px-4">
=======
      {/* FLOATING AUTO SCROLL */}
      <div className="fixed bottom-10 right-6 z-[60] flex flex-col gap-3">
        {isScrolling && (
            <div className="flex flex-col items-center gap-2 bg-black/80 border border-white/10 p-2 rounded-2xl backdrop-blur-lg">
                <button onClick={() => setScrollSpeed(prev => Math.min(prev + 1, 6))} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg">+</button>
                <span className="text-[10px] font-black text-yellow-500 italic">{scrollSpeed}</span>
                <button onClick={() => setScrollSpeed(prev => Math.max(prev - 1, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg">-</button>
            </div>
        )}
        <button 
          onClick={() => setIsScrolling(!isScrolling)}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-[8px] tracking-tighter shadow-2xl transition-all duration-300 border-2 ${
            isScrolling ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-yellow-500 border-yellow-400 text-black'
          }`}
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
            {isScrolling ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/> : <path d="M8 5v14l11-7z"/>}
          </svg>
          {isScrolling ? 'STOP' : 'AUTO'}
        </button>
      </div>

      {/* IMAGES */}
      <main className="pt-20 flex flex-col items-center bg-black">
        <div className="w-full max-w-3xl">
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
          {chapter?.chapter?.data?.map((fileName, idx) => {
            const fullImageUrl = `${chapter.base_url}${chapter.chapter.path}${fileName}`;
            return (
              <img 
                key={idx} 
                src={fullImageUrl} 
                alt={`Page ${idx}`} 
                className="w-full h-auto block select-none pointer-events-none"
                loading="lazy"
              />
            );
          })}
        </div>
      </main>

      {/* FOOTER NAV */}
      <footer className="bg-[#0a0a0d] py-20 flex flex-col items-center gap-10 border-t border-white/5 px-6">
        <div className="flex flex-wrap justify-center gap-4">
          {chapter?.prev_chapter_id && (
            <Link href={`/komik/reader/${chapter.prev_chapter_id}`}>
              <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all">
                ← Prev Ch. {chapter.prev_chapter_number}
              </button>
            </Link>
          )}

          <Link href={`/komik/${chapter?.manga_id}`}>
            <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:text-yellow-500 transition-all">
              Daftar Chapter
            </button>
          </Link>

          {chapter?.next_chapter_id && (
            <Link href={`/komik/reader/${chapter.next_chapter_id}`}>
              <button className="px-10 py-4 bg-yellow-500 text-black rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-yellow-500/20 hover:scale-105 transition-all">
                Next Ch. {chapter.next_chapter_number} →
              </button>
            </Link>
          )}
        </div>
<<<<<<< HEAD
        
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="px-8 py-3 bg-red-500 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-500/20"
        >
          Kembali ke atas
        </button>

        <button 
          onClick={handleReport}
          className="text-[10px] font-bold text-gray-600 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Report Broken Chapter
        </button>
=======
>>>>>>> a2b1ab65f67d6484097531faad2143de3569ef89
      </footer>

      <style jsx global>{`
        body { background-color: black; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
}
