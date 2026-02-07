import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Hls from 'hls.js';

export default function DetailAnime() {
  const router = useRouter();
  const { id } = router.query;
  
  const [anime, setAnime] = useState(null);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isHls, setIsHls] = useState(false);
  const [error, setError] = useState(null); // Tambahan state error
  
  const videoRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Ambil Detail Anime
        const resDetail = await fetch(`/api/anime?path=anime/detail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ id: id }).toString()
        });
        
        const detailJson = await resDetail.json();
        if (!detailJson.data) throw new Error("Gagal mengambil detail anime");
        setAnime(detailJson.data);

        // 2. Ambil Server List
        const resServers = await fetch(`/api/anime?path=anime/get-server-list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' , 'x-api-key': 'ThWmZq4t7w!z%C*F-JaNdRgUkXn2r5u8',},
          body: new URLSearchParams({ 
            id: '164785', // Paman, pastikan ID episode ini dinamis nanti ya!
            animeID: id, 
            jenisAnime: '1' 
          }).toString()
        });
        
        const serverJson = await resServers.json();
        const serverList = serverJson.data || [];
        setServers(serverList);

        if (serverList.length > 0) {
          handleServerSelection(serverList[0]);
        }

      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Gagal memuat data. Periksa koneksi atau API Key.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleServerSelection = (serverObj) => {
    if (!serverObj) return;
    setSelectedServer(serverObj.id);
    setVideoUrl(serverObj.url);
    setIsHls(serverObj.url?.includes('.m3u8'));
  };

  useEffect(() => {
    if (isHls && videoUrl && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
        return () => hls.destroy();
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = videoUrl;
      }
    }
  }, [isHls, videoUrl]);

  // Jika Error
  if (error) {
    return (
      <div className="bg-[#050507] min-h-screen flex flex-col items-center justify-center text-white p-6">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">Coba Lagi</button>
      </div>
    );
  }

  // Jika Loading
  if (loading || !anime) {
    return (
      <div className="bg-[#050507] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] text-white/50 font-black tracking-[0.3em] uppercase">Loading Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-20">
      {/* ... Sisa HTML Paman tetap sama ... */}
      <nav className="p-4 bg-black/50 backdrop-blur-md flex items-center gap-4 border-b border-white/5">
        <button onClick={() => router.back()} className="hover:text-red-500 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h2 className="text-xs font-black uppercase tracking-widest truncate">{anime?.title}</h2>
      </nav>

      <div className="w-full aspect-video bg-black shadow-2xl overflow-hidden relative">
        {isHls ? (
          <video ref={videoRef} controls className="w-full h-full shadow-inner" poster={anime?.image_cover} />
        ) : (
          <iframe src={videoUrl} className="w-full h-full border-0 shadow-inner" allowFullScreen />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-red-600 leading-none">{anime?.title}</h1>
          <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-red-600 pl-4">{anime?.synopsis}</p>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#16161e]/50 border border-white/5 rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-6 italic">Server List</h3>
            <div className="flex flex-col gap-3">
              {servers.map((srv) => (
                <button 
                  key={srv.id} 
                  onClick={() => handleServerSelection(srv)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedServer === srv.id ? 'bg-red-600 border-red-600' : 'bg-black/40 border-white/5'}`}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase italic">{srv.server}</p>
                    <p className="text-[8px] font-bold opacity-70">{srv.quality}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}