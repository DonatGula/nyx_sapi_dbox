// components/Player.js
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function Player({ url, poster }) {
  const videoRef = useRef(null);
  const isHls = url?.includes('.m3u8');

  useEffect(() => {
    if (isHls && url && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        return () => hls.destroy();
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = url;
      }
    }
  }, [url, isHls]);

  return (
    <div className="w-full aspect-video bg-black relative">
      {isHls ? (
              // Di dalam Player.js Paman
        <video
          ref={videoRef}
          onEnded={props.onEnded} // INI YANG PENTING
          className="w-full h-full"
          controls
          poster={props.poster}
        />
      ) : (
        <iframe 
          src={url} 
          className="w-full h-full border-0" 
          allowFullScreen 
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      )}
    </div>
  );
}
