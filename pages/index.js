import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import CryptoJS from 'crypto-js';
import Hls from 'hls.js';

const SECRET_KEY = "nyxdrama2026"; 

const DramaCard = ({ drama, openDetail }) => (
  <div 
    onClick={() => openDetail(drama.dramaId)}
    className="group relative bg-[#1a1a20] rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all duration-500 shadow-2xl"
  >
    <div className="relative aspect-[2/3] overflow-hidden">
      <img src={drama.posterImgUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={drama.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-transparent to-transparent opacity-60"></div>
      
      <div className="absolute top-2 right-2">
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${drama.sourceProvider === "4" || drama.sourceProvider === 4 ? "bg-blue-600" : "bg-purple-600"}`}>
          {drama.sourceProvider === "4" || drama.sourceProvider === 4 ? "Anime" : "Drama"}
        </span>
      </div>

      <div className="absolute bottom-2 left-2 flex gap-1">
        <span className="bg-black/60 backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded-md border border-white/10">{drama.totalEpisodes} EP</span>
      </div>
    </div>
    <div className="p-3">
      <h4 className="text-[11px] font-bold leading-tight line-clamp-2 group-hover:text-purple-400 transition">{drama.title}</h4>
    </div>
  </div>
);

export default function Home() {
  const [dramas, setDramas] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState(false);

  // --- STATE UNTUK SWIPE ---
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const videoRef = useRef(null);

  useEffect(() => {
    fetch('/api/drama')
      .then(res => res.json())
      .then(data => {
        const bytes = CryptoJS.AES.decrypt(data.payload, SECRET_KEY);
        const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        setDramas(decrypted);
      })
      .catch(err => console.error("Access Denied"));
  }, []);

  useEffect(() => {
    if (activeEpisode && videoRef.current) {
      const video = videoRef.current;
      const videoSrc = activeEpisode.video_url;

      if (Hls.isSupported() && videoSrc.includes('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
      }
    }
  }, [activeEpisode]);

  const openDetail = async (id) => {
    setLoadingDetail(true);
    setActiveEpisode(null); 
    setShowEpisodes(false);
    try {
      const res = await fetch(`/api/drama/${id}`);
      const data = await res.json();
      if (data.err) throw new Error(data.err);
      setSelectedDrama(data); 
      if (data.episodes && data.episodes.length > 0) {
        setActiveEpisode(data.episodes[0]); 
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memuat detail");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleNext = () => {
    if (!selectedDrama || !activeEpisode) return;
    const currentIndex = selectedDrama.episodes.findIndex(ep => ep.number === activeEpisode.number);
    if (currentIndex < selectedDrama.episodes.length - 1) {
      setActiveEpisode(selectedDrama.episodes[currentIndex + 1]);
    }
  };

  // --- LOGIKA SWIPE ---
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpwardSwipe = distance > minSwipeDistance;
    if (isUpwardSwipe) handleNext();
  };

  const filtered = dramas.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
  const listAnime = filtered.filter(item => item.sourceProvider === "4" || item.sourceProvider === 4);
  const listShortDrama = filtered.filter(item => [1, 2, 3, 5, 6, 7, 8, 9].includes(Number(item.sourceProvider)));
  const listDramaSemi = filtered.filter(item => item.sourceProvider === "0" || item.sourceProvider === 0);

  return (
    <div className="bg-[#0f0f13] min-h-screen text-white font-sans selection:bg-purple-500 overflow-x-hidden">
      <Head>
        <title>N-Studio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="referrer" content="no-referrer" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <nav className="fixed top-0 w-full z-50 bg-[#0f0f13]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-500 rounded-lg flex items-center justify-center font-black text-xs">Nat</div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Studioo</h1>
          </div>
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Cari..." 
              className="w-full bg-white/5 border border-white/10 p-2 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
             <div className="flex gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link href="/komik" className="hover:text-yellow-500 transition">Manga</Link>
             <Link href="/anime" className="text-white border-b-2 border-red-600">anime</Link>
             <Link href="/" className="hover:text-red-500 transition hidden sm:block">Home</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-4 max-w-7xl mx-auto">
        {[
          { title: "Anime Series", list: listAnime, color: "bg-blue-500" },
          { title: "Short Drama", list: listShortDrama, color: "bg-green-500" },
          { title: "Drama Semi", list: listDramaSemi, color: "bg-red-500" }
        ].map((sec, idx) => sec.list.length > 0 && (
          <section key={idx} className="mb-12">
            <h3 className="font-bold text-xl flex items-center gap-2 mb-6 uppercase tracking-wider">
              <span className={`w-1.5 h-6 ${sec.color} rounded-full`}></span> {sec.title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sec.list.map(drama => <DramaCard key={drama.dramaId} drama={drama} openDetail={openDetail} />)}
            </div>
          </section>
        ))}
      </main>

      {selectedDrama && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
          <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden">
            
            <div 
              className="relative flex-1 flex flex-col bg-black overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {activeEpisode ? (
                  <video
                    ref={videoRef}
                    key={activeEpisode.video_url}
                    controls autoPlay onEnded={handleNext}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain pointer-events-auto"
                  >
                    {activeEpisode?.subtitle_url && (
                      <track
                        src={`/api/sub?url=${encodeURIComponent(activeEpisode.subtitle_url)}`}
                        kind="subtitles" srcLang="id" label="Indonesia" default
                      />
                    )}
                  </video>
                ) : (
                  <div className="text-gray-600 animate-pulse font-bold uppercase tracking-widest">Loading...</div>
                )}

                {/* Tombol Episode yang sudah diperbaiki labelnya */}
                <button 
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  className="absolute bottom-24 right-4 z-[110] bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-[10px] font-bold md:px-6 md:py-3 transition-all active:scale-90"
                >
                  {showEpisodes ? '✕ CLOSE' : '☰ EPISODE'}
                </button>
              </div>
            </div>

            {/* SIDEBAR DENGAN FITUR NOW PLAYING */}
            <div className={`
              absolute md:relative bottom-0 right-0 z-[120] bg-[#0a0a0d]/95 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/10 transition-all duration-500
              ${showEpisodes ? 'h-[60%] md:h-full w-full md:w-96 opacity-100' : 'h-0 md:h-full w-full md:w-0 opacity-0 pointer-events-none'}
            `}>
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-purple-500 tracking-tighter uppercase">List Episode</h3>
                  <button onClick={() => setShowEpisodes(false)} className="p-2 text-gray-400 hover:text-white rounded-full transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Indikator Episode Sedang Diputar */}
                <div className="mb-6 flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Playing: <span className="text-white">Episode {activeEpisode?.number}</span>
                  </p>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar pb-10">
                  {selectedDrama.episodes?.map((ep, i) => {
                    const isCurrent = activeEpisode?.video_url === ep.video_url;
                    return (
                      <button 
                        key={i}
                        onClick={() => {
                          setActiveEpisode(ep);
                          if(window.innerWidth < 768) setShowEpisodes(false);
                        }}
                        className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all border ${
                          isCurrent 
                          ? "bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/40 scale-105" 
                          : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                        }`}
                      >
                        {ep.number}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedDrama(null)} className="absolute top-4 left-4 z-[130] bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      )}

      {loadingDetail && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

        video::-webkit-media-text-track-container {
          overflow: visible !important;
          -webkit-transform: translateY(-15%) !important;
          transform: translateY(-15%) !important;
        }
        video::cue {
          background-color: rgba(0, 0, 0, 0.7) !important;
          color: white !important;
          font-size: 0.9em !important;
        }
        @media (max-width: 768px) {
          video::-webkit-media-text-track-container {
            -webkit-transform: translateY(-20%) !important;
            transform: translateY(-20%) !important;
          }
        }
      `}</style>
    </div>
  );
}