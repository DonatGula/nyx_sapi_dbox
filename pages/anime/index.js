import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AnimeHome() {
  const [recommend, setRecommend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        // Kita tembak ke Proxy kita sendiri
        const res = await fetch('/api/anime?path=pages/homepage', { method: 'POST' });
        const data = await res.json();
        setRecommend(data.recommend || []);
      } catch (err) {
        console.error("Gagal load anime", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  return (
    <div className="bg-[#050507] min-h-screen text-white font-sans selection:bg-red-600">
      <Head><title>N-Studio | Anime Streaming</title>
       <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* NAVBAR SIMPEL */}
      <nav className="fixed top-0 w-full z-50 bg-[#050507]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">Anim</div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">NIME</h1>
          </div>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link href="/komik" className="hover:text-yellow-500 transition">Manga</Link>
             <Link href="/anime" className="text-white border-b-2 border-red-600">Home</Link>
             <Link href="#" className="hover:text-red-500 transition">Movies</Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* HERO BANNER (Simple) */}
        <div className="relative w-full h-48 md:h-72 rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-red-900/20 to-black border border-white/5 flex items-center px-10">
           <div className="max-w-md">
              <span className="text-red-500 font-black text-[10px] tracking-[0.5em] uppercase mb-2 block">Premium Streaming</span>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase leading-none mb-4">Tonton Anime <br/> Tanpa Iklan.</h2>
           </div>
        </div>

        {/* REKOMENDASI SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-2 h-8 bg-red-600 rounded-full"></span>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Editor's Choice</h3>
          </div>

          {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recommend.map((anime) => (
                <Link href={`/anime/detail/${anime.id}`} key={anime.id} className="group">
                  <div className="relative aspect-[3/4.5] rounded-2xl overflow-hidden bg-[#16161e] border border-white/5 group-hover:border-red-600/50 transition-all duration-500">
                    <img 
                      src={anime.image_cover} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                      alt={anime.title}
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                       <span className="text-yellow-500 text-[10px]">★</span>
                       <span className="text-[10px] font-black">{anime.rating}</span>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                       <p className="text-red-500 text-[9px] font-black uppercase mb-1 tracking-widest">Episode {anime.episode}</p>
                       <h4 className="text-xs font-bold leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                          {anime.title}
                       </h4>
                       <div className="mt-2 flex items-center gap-2 opacity-60 text-[9px] font-bold italic uppercase">
                          <span>{anime.tahun}</span>
                          <span className="w-1 h-1 bg-white rounded-full"></span>
                          <span>{anime.status === "2" ? 'Completed' : 'Ongoing'}</span>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}