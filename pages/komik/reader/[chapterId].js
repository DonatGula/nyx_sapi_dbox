import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ReaderKomik() {
  const router = useRouter();
  const { chapterId } = router.query;
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;

    const fetchChapter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.shngm.io/v1/chapter/detail/${chapterId}`);
        const result = await res.json();
        
        // Simpan seluruh objek data
        setChapter(result.data);
      } catch (err) {
        console.error("Gagal muat chapter", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
    window.scrollTo(0, 0);
  }, [chapterId]);

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white">
      <Head>
        <title>Chapter {chapter?.chapter_number} - Reader</title>
        <meta name="referrer" content="no-referrer" />
      </Head>

      {/* FIXED TOP NAV */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-xs font-black flex items-center gap-2 hover:text-yellow-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          KEMBALI
        </button>
        <span className="text-sm font-black italic text-yellow-500">CHAPTER {chapter?.chapter_number}</span>
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
        <div className="w-full max-w-3xl">
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
      </footer>

      <style jsx global>{`
        body { background-color: black; }
        img { user-select: none; pointer-events: none; }
      `}</style>
    </div>
  );
}