import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Hls from 'hls.js';

export default function DetailAnime() {
  const router = useRouter();
  const { id } = router.query;
  
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedEp, setSelectedEp] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const initData = async () => {
      try {
        setLoading(true);
        console.log("Fetching detail for ID:", id);

        const res = await fetch(`/api/anime?path=anime/detail`, {
          method: 'POST',
          body: JSON.stringify({ id: id })
        });
        const json = await res.json();
        console.log("Detail API Response:", json);

        if (json.data) {
          setAnime(json.data);
          const epList = json.data.episodes || [];
          setEpisodes(epList);

          // Ambil episode pertama dari list (biasanya index terakhir atau index 0)
          if (epList.length > 0) {
            const firstEp = epList[0]; 
            console.log("Loading Episode 1:", firstEp.id);
            fetchServers(firstEp.id);
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

  const fetchServers = async (epId) => {
    setSelectedEp(epId);
    try {
      console.log("Fetching servers for Ep:", epId);
      const res = await fetch(`/api/anime?path=anime/get-server-list`, {
        method: 'POST',
        body: JSON.stringify({ id: epId, animeID: id, jenisAnime: '1' })
      });
      const json = await res.json();
      console.log("Server List Response:", json);
      
      const srvList = json.data || [];
      setServers(srvList);
      
      if (srvList.length > 0) {
        setVideoUrl(srvList[0].url);
      }
    } catch (err) {
      console.error("Gagal Load Servers:", err);
    }
  };

  useEffect(() => {
    const url = videoUrl;
    if (url && url.includes('.m3u8') && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        return () => hls.destroy();
      }
    }
  }, [videoUrl]);

  if (loading) return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center text-red-600 font-black italic">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="tracking-[0.5em] animate-pulse">SYNCHRONIZING...</p>
    </div>
  );

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-20 font-sans">
      <Head><title>{anime?.title || 'Loading...'}</title></Head>

      {/* PLAYER CONTAINER */}
      <div className="w-full aspect-video bg-black shadow-2xl relative">
        {videoUrl.includes('.m3u8') ? (
          <video ref={videoRef} controls className="w-full h-full" />
        ) : (
          <iframe src={videoUrl} className="w-full h-full border-0" allowFullScreen />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <h1 className="text-3xl font-black uppercase italic text-red-600 mb-4">{anime?.title}</h1>
        
        {/* EPISODE SELECTOR */}
        <div className="mt-10 bg-[#16161e] p-6 rounded-3xl border border-white/5">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 italic">Select Episode</h3>
           <div className="flex flex-wrap gap-2">
              {episodes.map((ep) => (
                <button 
                  key={ep.id}
                  onClick={() => fetchServers(ep.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${
                    selectedEp === ep.id ? 'bg-red-600 text-white' : 'bg-black/50 text-gray-500 hover:text-white border border-white/5'
                  }`}
                >
                  EP {ep.episode}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}