import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Hls from 'hls.js';

export default function DetailAnime() {
  const router = useRouter();
  const { id } = router.query;
  
  // --- STATE MANAGEMENT (PASTIKAN SEMUA ADA) ---
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedEp, setSelectedEp] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null); // INI YANG TADI KURANG
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isHls, setIsHls] = useState(false);
  
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Simpan instance HLS biar bisa di-destroy dengan bersih

  // 1. Ambil Detail Anime & Episode
  useEffect(() => {
    if (!id) return;

    const initData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/anime?path=anime/detail`, {
          method: 'POST',
          body: JSON.stringify({ id: id })
        });
        const json = await res.json();

        // Sesuai log Paman: Datanya langsung di root object (bukan json.data)
        if (json && json.id) {
          setAnime(json);
          const epList = json.episodes || [];
          setEpisodes(epList);

          if (epList.length > 0) {
            // Putar episode pertama secara otomatis
            fetchServers(epList[0].id);
          }
        }
      } catch (err) {
        console.error("Gagal Load Detail:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id]);

  // 2. Ambil List Server (Berdasarkan Klik Episode)
  const fetchServers = async (epId) => {
  setSelectedEp(epId);
  setLoading(true); // Kasih loading sebentar pas ganti episode
  
  try {
    const res = await fetch(`/api/anime?path=anime/get-server-list`, {
      method: 'POST',
      body: JSON.stringify({ id: epId, animeID: id, jenisAnime: '1' })
    });
    const json = await res.json();
    const srvList = json.list || [];
    setServers(srvList);

    if (srvList.length > 0) {
      // --- LOGIKA AUTO-SELECT MULAI DI SINI ---
      
      // 1. Cari yang tipenya HLS (.m3u8) duluan karena paling stabil & tanpa blokir iframe
      const bestServer = srvList.find(s => s.url.includes('.m3u8')) 
                      || srvList.find(s => s.quality === 'HD') // 2. Kalau gak ada, cari yang HD
                      || srvList[0]; // 3. Kalau gak ada juga, ambil yang paling pertama

      console.log("Auto-selecting best server:", bestServer.server);
      handleServerSelection(bestServer);
      
    } else {
      setError("Duh, episode ini belum ada servernya Paman.");
    }
  } catch (err) {
    console.error("Gagal ambil server:", err);
    setError("Koneksi server lagi bermasalah.");
  } finally {
    setLoading(false);
  }
};

  // 3. Set URL Video & Cek tipe (M3U8 atau Embed)
  const handleServerSelection = (srv) => {
    setSelectedServer(srv.id);
    setVideoUrl(srv.url);
    
    // Cek apakah link m3u8 (HLS)
    if (srv.url?.includes('.m3u8')) {
      setIsHls(true);
    } else {
      setIsHls(false);
    }
  };

  // 4. Player Logic (HLS.js)
  useEffect(() => {
    if (isHls && videoUrl && videoRef.current) {
      // Hapus player lama kalau ada (biar gak numpuk)
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const video = videoRef.current;
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      }
    }
  }, [isHls, videoUrl]);

  if (loading || !anime) return (
    <div className="bg-black min-h-screen flex items-center justify-center text-red-600 font-black italic">
      LOADING...
    </div>
  );

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-20 font-sans">
      <Head><title>{anime.title}</title></Head>

      {/* PLAYER SECTION */}
      <div className="w-full aspect-video bg-black shadow-2xl relative border-b border-white/5">
        {videoUrl ? (
          isHls ? (
            <video ref={videoRef} controls className="w-full h-full" poster={anime.image_cover} autoPlay />
          ) : (
            <iframe src={videoUrl} className="w-full h-full border-0" allowFullScreen />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-600">
            Mempersiapkan Video...
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-red-600 mb-6">{anime.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-red-600 pl-4">
              {anime.content?.replace(/&lt;p&gt;|&lt;\/p&gt;/g, '') || "No synopsis."}
            </p>

            {/* EPISODE LIST */}
            <div className="bg-[#16161e] p-6 rounded-3xl border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 italic">Select Episode</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {episodes.map((ep) => (
                  <button 
                    key={ep.id}
                    onClick={() => fetchServers(ep.id)}
                    className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                      selectedEp === ep.id ? 'bg-red-600 text-white' : 'bg-black/50 text-gray-500 border border-white/5'
                    }`}
                  >
                    EP {ep.episode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SERVER SELECTION */}
          <div className="lg:col-span-1">
            <div className="bg-[#16161e] p-6 rounded-3xl border border-white/5 sticky top-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6 italic">Servers</h3>
              <div className="flex flex-col gap-3">
                {servers.map((srv) => (
                  <button 
                    key={srv.id}
                    onClick={() => handleServerSelection(srv)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedServer === srv.id ? 'bg-red-600 border-red-600 text-white' : 'bg-black/40 border-white/5 text-gray-500'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase italic">{srv.server}</p>
                    <p className="text-[8px] font-bold opacity-60">{srv.quality}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}