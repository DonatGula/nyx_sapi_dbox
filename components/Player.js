// components/Player.js
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

const Player = forwardRef(({ url, poster, onEnded, onTimeUpdate }, ref) => {
  const videoRef = useRef(null);
  // Check for common video extensions or HLS manifest
  const isDirectVideo = url && /\.(mp4|m3u8|webm|ogg)$/i.test(url);
  const isHls = url && /\.m3u8$/i.test(url);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isDirectVideo) return;

    if (isHls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(() => {});
        });
        return () => {
            hls.destroy();
            // videoElement.removeAttribute('src'); // Optional: clear src
        };
    } else {
      // For native HLS support (Safari) or other direct video files (mp4, webm)
      videoElement.src = url;
    }
  }, [url, isHls, isDirectVideo]);

  useImperativeHandle(ref, () => ({
    requestPip: () => {
      const videoElement = videoRef.current;
      if (videoElement && document.pictureInPictureEnabled && !videoElement.disablePictureInPicture) {
        try {
          if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
          } else {
            videoElement.requestPictureInPicture();
          }
        } catch (error) {
          console.error("PiP Error:", error);
        }
      }
    }
  }));

  return (
    <div className="w-full aspect-video bg-black relative">
      {isDirectVideo ? (
              // Di dalam Player.js Paman
        <video
          ref={videoRef}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          className="w-full h-full"
          controls
          poster={poster}
          autoPlay
        />
      ) : (
        <iframe 
          src={url ? (url.includes('autoplay=1') ? url : (url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`)) : url}
          className="w-full h-full border-0" 
          allowFullScreen 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        />
      )}
    </div>
  );
});

export default Player;
