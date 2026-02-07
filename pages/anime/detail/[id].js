import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Hls from 'hls.js';

export default function DetailAnime() {
  const router = useRouter();
  const { id } = router.query; // Ini animeID (contoh: 4529)
  
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedEp, setSelectedEp] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isHls, setIsHls] = useState(false);
  
  const videoRef = useRef(null);

  // 1. Ambil Detail & List Episode
  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/anime?path=anime/detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ id: id }).toString()
        });
        const json = await res.json();
        
        if (json.data) {
          setAnime(json.data);
          const epList = json.data.episodes || [];
          setEpisodes(epList);

          // OTOMATIS: Ambil Server untuk Episode Pertama (paling bawah biasanya Ep 1)
          if (epList.length > 0) {
            const firstEp = epList[epList.length - 1]; // Ambil episode 1
            fetchServers(firstEp.id);
          }
        }
      } catch (err) {
        console.error("Detail Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // 2. Fungsi Ambil Server Berdasarkan ID Episode
  const fetchServers = async (episodeId) => {
    setSelectedEp(episodeId);
    setServers([]); // Reset server list pas ganti episode
    try {
      const res = await fetch('/api/anime?path=anime/get-server-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 
          id: episodeId, 
          animeID: id, 
          jenisAnime: '1' 
        }).toString()
      });
      const json = await res.json();
      const serverList = json.data || [];
      setServers(serverList);

      if (serverList.length > 0) {
        handleServerSelection(serverList[0]);
      }
    } catch (err) {
      console.error("Server Error:", err);
    }
  };

  const handleServerSelection = (serverObj) => {
    setSelectedServer(serverObj.id);
    setVideoUrl(serverObj.url);
    setIsHls(serverObj.url?.includes('.m3u8'));
  };

  // 3. Player Engine (HLS)
  useEffect(() => {
    if (isHls && videoUrl && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    }
  }, [isHls, videoUrl]);

  if (loading || !anime) return <div className="bg-black min-h-screen flex items-center justify-center text-red-600 font-bold animate-pulse">LOADING ANIME...</div>;

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-20 font-sans">
      <Head><title>{anime.title}</title></Head>

      {/* PLAYER AREA */}
      <div className="w-full aspect-video bg-black sticky top-0 z-40 shadow-2xl">
        {isHls ? (
          <video ref={videoRef} controls className="w-full h-full" poster={anime.image_cover} />
        ) : (
          <iframe src={videoUrl} className="w-full h-full border-0" allowFullScreen />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* INFO & EPISODES */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-red-600 mb-2">{anime.title}</h1>
            <p className="text-xs text-gray-500 leading-relaxed italic">{anime.synopsis}</p>
          </div>

          {/* LIST EPISODE */}
          <div className="bg-[#16161e] rounded-3xl p-6 border border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Episode List</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {episodes.map((ep) => (
                <button 
                  key={ep.id}
                  onClick={() => fetchServers(ep.id)}
                  className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                    selectedEp === ep.id ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-white/5 text-gray-400 hover:border-red-600'
                  }`}
                >
                  EP {ep.episode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR SERVER */}
        <div className="lg:col-span-1">
          <div className="bg-[#16161e] rounded-3xl p-6 border border-white/5 sticky top-28">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-4 italic">Available Servers</h3>
            <div className="space-y-3">
              {servers.map((srv) => (
                <button 
                  key={srv.id}
                  onClick={() => handleServerSelection(srv)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    selectedServer === srv.id ? 'bg-red-600 border-red-600' : 'bg-black border-white/5 text-gray-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase italic">{srv.server}</span>
                  <span className="text-[8px] font-bold opacity-60 uppercase">{srv.quality}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}