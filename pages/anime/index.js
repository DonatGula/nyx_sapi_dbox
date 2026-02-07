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
        // Memanggil proxy API
        const res = await fetch('/api/anime?path=pages/homepage', { 
          method: 'POST' 
        });
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
      <Head>
        <title>N-Studio | Anime Streaming</title>
       <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#050507]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/anime" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] group-hover:scale-110 transition">
              A
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">NIME</h1>
          </Link>
          
          <div className="flex gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link href="/komik" className="hover:text-yellow-500 transition">Manga</Link>
             <Link href="/anime" className="text-white border-b-2 border-red-600">anime</Link>
             <Link href="" className="hover:text-red-500 transition hidden sm:block">Home</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 md:pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        {/* HERO BANNER */}
        <div className="relative w-full h-44 md:h-72 rounded-2xl md:rounded-3xl overflow-hidden mb-10 bg-gradient-to-r from-red-900/40 to-black border border-white/5 flex items-center px-6 md:px-12">
           <div className="max-w-md relative z-10">
              <span className="text-red-500 font-black text-[9px] md:text-[10px] tracking-[0.4em] uppercase mb-2 block">Premium Streaming</span>
              <h2 className="text-2xl md:text-5xl font-black italic uppercase leading-none mb-4 shadow-black drop-shadow-md">
                Tonton Anime <br/> Tanpa Iklan.
              </h2>
           </div>
           {/* Dekorasi Cahaya */}
           <div className="absolute right-0 top-0 w-1/2 h-full bg-red-600/10 blur-[100px] pointer-events-none"></div>
        </div>

        {/* SECTION REKOMENDASI */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 md:h-8 bg-red-600 rounded-full"></span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Editor's Choice</h3>
            </div>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black tracking-widest uppercase">Fetching Anime...</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {recommend.map((anime) => (
                <Link href={`/anime/detail/${anime.id}`} key={anime.id} className="group">
                  <div className="relative aspect-[3/4.5] rounded-xl md:rounded-2xl overflow-hidden bg-[#16161e] border border-white/5 group-hover:border-red-600/50 transition-all duration-500 shadow-lg">
                    <img 
                      src={anime.image_cover} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                      alt={anime.title}
                      loading="lazy"
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/70 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-white/10 flex items-center gap-1">
                       <span className="text-yellow-500 text-[8px] md:text-[10px]">★</span>
                       <span className="text-[8px] md:text-[10px] font-black">{anime.rating}</span>
                    </div>

                    {/* Overlay Info */}
                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-[#050507] via-[#050507]/90 to-transparent">
                       <p className="text-red-500 text-[8px] md:text-[9px] font-black uppercase mb-1 tracking-wider">Ep {anime.episode}</p>
                       <h4 className="text-[11px] md:text-xs font-bold leading-tight line-clamp-2 group-hover:text-red-500 transition-colors min-h-[2.5em]">
                          {anime.title}
                       </h4>
                       <div className="mt-2 flex items-center gap-2 opacity-50 text-[8px] md:text-[9px] font-bold italic uppercase">
                          <span>{anime.tahun}</span>
                          <span className="w-1 h-1 bg-white rounded-full"></span>
                          <span>{anime.status === "2" ? 'End' : 'On'}</span>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        body {
          background-color: #050507;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}