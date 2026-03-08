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

  useEffect(() => {
    if (!chapterId) return;

    const fetchChapter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.shngm.io/v1/chapter/detail/${chapterId}`);
        const result = await res.json();
        
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
      } catch (err) {
        console.error("Gagal muat chapter", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
    window.scrollTo(0, 0);
  }, [chapterId]);

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

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white">
      <Head>
        <title>{mangaDetail?.title} - Chapter {chapter?.chapter_number}</title>
        <meta name="referrer" content="no-referrer" />
      </Head>

      {/* FIXED TOP NAV */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-xs font-black flex items-center gap-2 hover:text-yellow-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          KEMBALI
        </button>
        <span className="text-sm font-black italic text-yellow-500">CHAPTER {chapter?.chapter_number}</span>
        <button onClick={toggleBookmark} className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-white'}`}>
            <svg className="w-6 h-6" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        </button>

        <div>
            {/* Tombol Chapter Selanjutnya */}
          {chapter?.next_chapter_id ? (
            <Link href={`/komik/reader/${chapter.next_chapter_id}`}>
              <button className="px-8 py-3 bg-green-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-yellow-500/20">
                Next {chapter.next_chapter_number} →
              </button>
            </Link>
          ) : (
            <Link href={`/komik/${chapter?.manga_id}`}>
              <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">
                Kembali ke Daftar
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* IMAGE RENDERER */}
      <main className="pt-16 flex flex-col items-center">
        <div className="w-full max-w-3xl px-0 sm:px-4">
          {chapter?.chapter?.data?.map((fileName, idx) => {
            // KONSTRUKSI URL GAMBAR: base_url + path + fileName
            const fullImageUrl = `${chapter.base_url}${chapter.chapter.path}${fileName}`;
            
            return (
              <img 
                key={idx} 
                src={fullImageUrl} 
                alt={`Page ${idx}`} 
                className="w-full h-auto block"
                loading="lazy"
              />
            );
          })}
        </div>
      </main>

      {/* NEXT & PREV NAVIGATION */}
      <footer className="bg-[#0a0a0d] py-20 flex flex-col items-center gap-8 border-t border-white/5">
        <div className="flex gap-4">
          {/* Tombol Chapter Sebelumnya */}
          {chapter?.prev_chapter_id && (
            <Link href={`/komik/reader/${chapter.prev_chapter_id}`}>
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10">
                ← Prev Ch. {chapter.prev_chapter_number}
              </button>
            </Link>
          )}

          {/* Tombol Chapter Selanjutnya */}
          {chapter?.next_chapter_id ? (
            <Link href={`/komik/reader/${chapter.next_chapter_id}`}>
              <button className="px-8 py-3 bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-yellow-500/20">
                Next Ch. {chapter.next_chapter_number} →
              </button>
            </Link>
          ) : (
            <Link href={`/komik/${chapter?.manga_id}`}>
              <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">
                Kembali ke Daftar
              </button>
            </Link>
          )}
        </div>
        
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
      </footer>

      <style jsx global>{`
        body { background-color: black; }
        img { user-select: none; pointer-events: none; }
      `}</style>
    </div>
  );
}