import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function DetailKomik() {
  const router = useRouter();
  const { id } = router.query;
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const resDetail = await fetch(`https://api.shngm.io/v1/manga/detail/${id}`);
        const dataDetail = await resDetail.json();
        setManga(dataDetail.data);

        const resChapters = await fetch(`https://api.shngm.io/v1/chapter/${id}/list?page=1&page_size=100&sort_by=chapter_number&sort_order=desc`);
        const dataChapters = await resChapters.json();
        setChapters(dataChapters.data || []);
      } catch (err) {
        console.error("Gagal memuat data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="bg-[#0a0a0d] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

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
             <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{manga?.title}</h1>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chapters.length > 0 ? chapters.map((ch) => (
              <button 
                key={ch.chapter_id}
                onClick={() => router.push(`/komik/reader/${ch.chapter_id}`)}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#0a0a0d] border border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/[0.03] group transition-all text-left"
              >
                <div>
                  <span className="text-xs font-black group-hover:text-yellow-500 transition-colors uppercase">Chapter {ch.chapter_number}</span>
                  <p className="text-[10px]  font-bold uppercase mt-1 italic">Update: {new Date(ch.release_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>
            )) : (
              <p className="col-span-full text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">No Chapters Yet</p>
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