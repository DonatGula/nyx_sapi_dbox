import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function DetailAnime() {
  // ... state sebelumnya (anime, servers, loading, dll) ...
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedServer, setSelectedServer] = useState(null);
  const videoRef = useRef(null);
  const [isHls, setIsHls] = useState(false);

  const fetchVideoUrl = async (serverId) => {
    setSelectedServer(serverId);
    try {
      // Sesuai JSON Paman: kita cari server yang dipilih dari list
      const selected = servers.find(s => s.id === serverId);
      const url = selected.url;
      setVideoUrl(url);

      // CEK: Apakah ini file m3u8 atau link Embed (Blogspot)
      if (url.includes('.m3u8')) {
        setIsHls(true);
        handleHls(url);
      } else {
        setIsHls(false);
      }
    } catch (err) {
      console.error("Gagal load video", err);
    }
  };

  const handleHls = (url) => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Support native untuk Safari/iPhone
      videoRef.current.src = url;
    }
  };

  return (
    <div className="bg-[#050507] min-h-screen text-white">
      {/* AREA PLAYER */}
      <div className="w-full aspect-video bg-black shadow-2xl">
        {isHls ? (
          // Jika Direct Link M3U8 (Server 18)
          <video 
            ref={videoRef} 
            controls 
            className="w-full h-full outline-none" 
            poster={anime?.image_cover}
          />
        ) : (
          // Jika Embed Link (Server 5 / Blogspot)
          <iframe 
            src={videoUrl} 
            className="w-full h-full border-0" 
            allowFullScreen
          />
        )}
      </div>

      {/* SELECTION SERVER DENGAN INFO KUALITAS */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-red-500 flex items-center gap-2">
           <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
           Quality & Server Selection
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((srv) => (
            <button 
              key={srv.id}
              onClick={() => fetchVideoUrl(srv.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedServer === srv.id 
                ? 'bg-red-600 border-red-600' 
                : 'bg-[#16161e] border-white/5 hover:border-red-600/40'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-tighter italic">
                  {srv.server}
                </span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded mt-1 ${
                  srv.quality === 'HD' ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'
                }`}>
                  {srv.quality}
                </span>
              </div>
              <svg className="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
