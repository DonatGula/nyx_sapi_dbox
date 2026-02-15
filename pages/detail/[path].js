import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Player from '../../components/Player';

export default function DetailPage() {
  const router = useRouter();
  const { path } = router.query;
  const [movie, setMovie] = useState(null);
  const [activeVideo, setActiveVideo] = useState('');
  const [currentEp, setCurrentEp] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false); // State Dark Mode
  const [activeSeason, setActiveSeason] = useState(0); // Index season yang aktif

  useEffect(() => {
    if (path) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/movies?action=detail&detailPath=${encodeURIComponent(path)}`);
          const json = await res.json();
          if (json.success && json.data) {
            setMovie(json.data);
            const firstEp = json.data.seasons?.[0]?.episodes?.[0];
            if (firstEp) {
                setActiveVideo(firstEp.playerUrl);
                setCurrentEp(firstEp.episode);
            } else {
                setActiveVideo(json.data.playerUrl);
            }
          }
        } catch (err) { console.error(err); } finally { setLoading(false); }
      };
      fetchDetail();
    }
  }, [path]);

  const handleNextEpisode = () => {
    const episodes = movie?.seasons?.[0]?.episodes;
    if (!episodes) return;
    const nextEpIndex = episodes.findIndex(ep => ep.episode === currentEp) + 1;
    if (nextEpIndex < episodes.length) {
      const nextEp = episodes[nextEpIndex];
      setActiveVideo(nextEp.playerUrl);
      setCurrentEp(nextEp.episode);
    }
  };

  if (loading || !movie) return (
    <div className={`min-h-screen flex items-center justify-center font-black animate-pulse tracking-[0.5em] ${isDark ? 'bg-[#0f172a] text-pink-500' : 'bg-[#FDF2F8] text-[#FF2D85]'}`}>LOADING...</div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-[#FF2D85] selection:text-white pb-20 ${isDark ? 'bg-[#050507] text-white/80' : 'bg-[#FDF2F8] text-slate-800'}`}>
      <Head><title>{movie.title} — N-STREAM</title></Head>

      {/* NAVBAR */}
       <nav className="fixed top-0 w-full z-50 backdrop-blur-sm">
        <div className={`mx-auto flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border p-4 px-8 transition-all ${isDark ? 'bg-[#111114]/80 backdrop-blur-xl border-white/5' : 'bg-white/80 backdrop-blur-xl border-pink-100'}`}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                <div className="bg-[#FF2D85] text-white px-3 py-1 rounded-xl font-black italic shadow-[3px_3px_0px_#000]">N</div>
                <span className={`font-black tracking-tighter italic text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>STREAM</span>
            </div>
            
            {/* TOGGLE DARK MODE */}
            <button 
                onClick={() => setIsDark(!isDark)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-tighter transition-all border-2 ${isDark ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-slate-100 border-transparent text-slate-500'}`}
            >
                {isDark ? '🌙 Night Mode' : '☀️ Day Mode'}
            </button>
        </div>
      </nav>

      <main className="max-w-7xl pt-35 mx-auto px-4 sm:px-6 space-y-8">
        {/* ROW 1: PLAYER & EPISODES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className={`lg:col-span-8 bg-black rounded-[1rem] overflow-hidden shadow-2xl border-[6px] transition-colors ${isDark ? 'border-[#1a1a1e]' : 'border-white'}`}>
            <Player url={activeVideo} poster={movie.poster} onEnded={handleNextEpisode} />
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <div className={`rounded-[3rem] border flex flex-col overflow-hidden shadow-xl h-full transition-all ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-pink-100'}`} style={{ maxHeight: '500px' }}>
              
              {/* HEADER & SEASON SELECTOR */}
              <div className={`p-6 border-b ${isDark ? 'bg-[#16161a] border-white/5' : 'bg-pink-50 border-pink-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[15px] font-black uppercase tracking-[0.2em] text-[#FF2D85]">Episodes</h3>
                  <span className="text-[15px] font-black px-3 py-1 bg-[#FF2D85] text-white rounded-full shadow-[2px_2px_0px_#000]">
                    {movie.seasons?.[activeSeason]?.episodes.length} EP
                  </span>
                </div>

                {/* TABS SEASON */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {movie.seasons?.map((s, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSeason(index)}
                      className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase transition-all border-2 whitespace-nowrap ${
                        activeSeason === index
                          ? 'bg-black border-black text-white shadow-[3px_3px_0px_#FF2D85]'
                          : isDark 
                            ? 'bg-white/5 border-transparent text-white/40 hover:text-white' 
                            : 'bg-white border-pink-100 text-slate-400 hover:text-[#FF2D85]'
                      }`}
                    >
                      Season {s.season}
                    </button>
                  ))}
                </div>
              </div>

              {/* EPISODE GRID */}
              <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isDark ? 'bg-[#0a0a0c]' : 'bg-white'}`}>
                <div className="grid grid-cols-5 gap-3">
                  {movie.seasons?.[activeSeason]?.episodes.map((ep) => (
                    <button 
                      key={ep.episode}
                      onClick={() => { 
                        setActiveVideo(ep.playerUrl); 
                        setCurrentEp(ep.episode); 
                      }}
                      className={`aspect-square rounded-1xl text-[15px] font-bold transition-all border-2 flex items-center justify-center ${
                        currentEp === ep.episode 
                        ? 'bg-[#FF2D85] border-black text-white shadow-[4px_4px_0px_#000] -translate-y-1' 
                        : isDark 
                          ? 'bg-[#1a1a1e] border-transparent text-white/20 hover:text-pink-500' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:text-[#FF2D85]'
                      }`}
                    >
                      {ep.episode}
                    </button>
                  ))}
                </div>
              </div>

              {/* FOOTER INFO */}
              <div className={`p-4 text-center border-t ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-pink-50'}`}>
                  <p className="text-[15px] font-black text-pink-500 uppercase tracking-widest">Watching Season {movie.seasons?.[activeSeason]?.season}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
             <div className={`p-4 rounded-[3rem] shadow-2xl border transition-all transform -rotate-2 hover:rotate-0 ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-pink-100'}`}>
                <img src={movie.poster} className="w-full h-auto rounded-[2.5rem] shadow-lg" alt="poster" />
             </div>
          </div>

          <div className={`lg:col-span-9 rounded-[3rem] p-10 border shadow-xl flex flex-col justify-center relative overflow-hidden transition-all ${isDark ? 'bg-[#111114] border-white/5' : 'bg-gradient-to-br from-white to-pink-50 border-white'}`}>
            <div className={`flex gap-3 items-center text-[15px] font-black text-[#FF2D85] uppercase tracking-widest mb-6`}>
                <span className={`px-3 py-1 rounded-full shadow-sm ${isDark ? 'bg-white/5' : 'bg-white'}`}>{movie.year}</span>
                <span>•</span>
                <span className={`px-3 py-1 rounded-full shadow-sm ${isDark ? 'bg-white/5' : 'bg-white'}`}>{movie.type}</span>
                <span>•</span>
                <span className={`text-yellow-500 px-3 py-1 rounded-full shadow-sm ${isDark ? 'bg-white/5' : 'bg-white'}`}>★ {movie.rating}</span>
            </div>
            <h1 className={`text-2xl md:text-2xl font-black uppercase tracking-tighter mb-6 leading-[0.9] italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{movie.title}</h1>
            <p className={`text-lg leading-relaxed font-medium italic ${isDark ? 'text-white/40' : 'text-slate-500'}`}>"{movie.description}"</p>
            <div className={`mt-8 grid grid-cols-3 gap-4 p-6 rounded-[2rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-pink-100 shadow-sm'}`}>
              {/* Box Country */}
              <div className="flex flex-col">
                <p className="text-[9px] uppercase font-black text-pink-500 mb-1 tracking-[0.2em]">Country</p>
                <p className={`text-xs md:text-sm font-bold italic truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {movie.country}
                </p>
              </div>

              {/* Box Genres */}
              <div className="flex flex-col border-x border-pink-500/20 px-4">
                <p className="text-[9px] uppercase font-black text-pink-500 mb-1 tracking-[0.2em]">Genres</p>
                <p className={`text-xs md:text-sm font-bold italic truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {movie.genre}
                </p>
              </div>
              {/* Box Release */}
              <div className="flex flex-col items-end">
                <p className="text-[9px] uppercase font-black text-pink-500 mb-1 tracking-[0.2em]">Release Date</p>
                <p className={`text-xs md:text-sm font-bold italic truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {movie.releaseDate}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ROW 3: CAST */}
        <div className={`rounded-[4rem] p-12 shadow-xl border transition-all ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-pink-50'}`}>
           <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400  text-center">Starring Cast</h3>
           <div className="flex gap-12 p-10 overflow-x-auto custom-scrollbar-h">
              {movie.cast?.map((person, i) => (
                <div key={i} className="flex-shrink-0 group text-center space-y-4">
                  <div className={`w-28 h-28 rounded-[2rem] overflow-hidden border-4 transition-all duration-500 group-hover:border-[#FF2D85] group-hover:scale-110 shadow-lg mx-auto transform group-hover:-rotate-3 ${isDark ? 'bg-white/5 border-transparent' : 'bg-slate-100 border-white'}`}>
                    {person.avatar ? <img src={person.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-pink-100 text-[#FF2D85] font-black">N/A</div>}
                  </div>
                  <div>
                    <p className={`text-[12px] font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>{person.name}</p>
                    <p className="text-[10px] font-bold text-pink-400 uppercase italic">{person.character}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF2D85; border-radius: 10px; }
        .custom-scrollbar-h::-webkit-scrollbar { height: 5px; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: #FF2D85; border-radius: 10px; }
      `}</style>
    </div>
  );
}