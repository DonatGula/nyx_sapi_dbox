import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Hls from 'hls.js';

export default function DetailAnime() {
  const router = useRouter();
  const { id } = router.query;
  
  // State Management
  const [anime, setAnime] = useState(null);
  const [servers, setServers] = useState([]); // Inisialisasi array kosong agar tidak undefined
  const [selectedServer, setSelectedServer] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isHls, setIsHls] = useState(false);
  
  const videoRef = useRef(null);

  // 1. Fetch Data Awal (Detail & Server List)
  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Ambil Detail Anime
        const resDetail = await fetch('/api/anime?path=anime/detail', {
          method: 'POST',
          body: JSON.stringify({ id: id })
        });
        const detailJson = await resDetail.json();
        setAnime(detailJson.data);

        // Ambil Server List (Sesuaikan dengan parameter yang Paman temukan)
        const resServers = await fetch('/api/anime?path=anime/get-server-list', {
          method: 'POST',
          body: JSON.stringify({ 
            id: '164785', // ID Episode
            animeID: id, 
            jenisAnime: '1' 
          })
        });
        const serverJson = await resServers.json();
        const serverList = serverJson.data || [];
        setServers(serverList);

        // Auto-play server pertama jika ada
        if (serverList.length > 0) {
          handleServerSelection(serverList[0]);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // 2. Logika Pemilihan Server & Setup Player
  const handleServerSelection = (serverObj) => {
    if (!serverObj) return;
    
    setSelectedServer(serverObj.id);
    const url = serverObj.url;
    setVideoUrl(url);

    if (url?.includes('.m3u8')) {
      setIsHls(true);
    } else {
      setIsHls(false);
    }
  };

  // 3. Effect khusus untuk HLS Player
  useEffect(() => {
    if (isHls && videoUrl && videoRef.current) {
      const video = videoRef.current;
      
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      }
    }
  }, [isHls, videoUrl]);

  // Safety Check untuk Vercel (Prerendering Guard)
  if (loading || !anime) {
    return (
      <div className="bg-[#050507] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-20">
      <Head>
        <title>{anime?.title || 'Loading...'} - N-Anime</title>
        <meta name="referrer" content="no-referrer" />
      </Head>

      {/* HEADER NAV */}
      <nav className="p-4 bg-black/50 backdrop-blur-md flex items-center gap-4 border-b border-white/5">
        <button onClick={() => router.back()} className="hover:text-red-500 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h2 className="text-xs font-black uppercase tracking-widest truncate">{anime?.title}</h2>
      </nav>

      {/* PLAYER SECTION */}
      <div className="w-full aspect-video bg-black shadow-2xl overflow-hidden relative">
        {isHls ? (
          <video ref={videoRef} controls className="w-full h-full" poster={anime?.image_cover} />
        ) : (
          <iframe src={videoUrl} className="w-full h-full border-0" allowFullScreen />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* INFO ANIME */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-red-600">{anime?.title}</h1>
          <div className="flex gap-3 text-[10px] font-bold opacity-60 italic">
            <span>{anime?.tahun || '2026'}</span>
            <span>•</span>
            <span>{anime?.status === "2" ? 'COMPLETED' : 'ONGOING'}</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-red-600 pl-4">
            {anime?.synopsis || 'No synopsis available.'}
          </p>
        </div>

        {/* SERVER LIST SELECTION */}
        <div className="lg:col-span-1">
          <div className="bg-[#16161e]/50 border border-white/5 rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-6 italic">Pilih Server & Kualitas</h3>
            <div className="flex flex-col gap-3">
              {servers.length > 0 ? servers.map((srv) => (
                <button 
                  key={srv.id}
                  onClick={() => handleServerSelection(srv)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedServer === srv.id 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                    : 'bg-black/40 border-white/5 hover:border-red-600/50 text-gray-400'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase italic">{srv.server || 'Server'}</p>
                    <p className="text-[8px] font-bold opacity-70">{srv.quality || 'SD'}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${selectedServer === srv.id ? 'bg-white' : 'bg-gray-600'}`}></div>
                </button>
              )) : (
                <p className="text-[10px] text-center text-gray-600">Mencari server video...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #050507; }
      `}</style>
    </div>
  );
}