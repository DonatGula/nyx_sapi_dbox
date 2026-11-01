// components/Player.js
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

const Player = forwardRef(({ url, poster, onEnded, onTimeUpdate }, ref) => {
  const videoRef = useRef(null);
  // Accept signed media URLs that include query strings or fragments.
  const isDirectVideo = Boolean(url && /\.(mp4|m3u8|webm|ogg)(?:$|[?#])/i.test(url));
  const isHls = Boolean(url && /\.m3u8(?:$|[?#])/i.test(url));

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isDirectVideo) return undefined;

    let hls;
    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, capLevelToPlayerSize: true });
      hls.loadSource(url);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(() => {});
      });
    } else if (!isHls || videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = url;
      videoElement.load();
    } else {
      // Unsupported HLS browsers keep the video element visible and expose a
      // native playback error rather than silently treating a media URL as an iframe.
      videoElement.src = url;
    }

    return () => {
      if (hls) hls.destroy();
      videoElement.pause();
      videoElement.removeAttribute('src');
      videoElement.load();
    };
  }, [url, isHls, isDirectVideo]);

  useImperativeHandle(ref, () => ({
    requestPip: async () => {
      const videoElement = videoRef.current;
      if (!videoElement || !document.pictureInPictureEnabled || videoElement.disablePictureInPicture) return;
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await videoElement.requestPictureInPicture();
      } catch (error) {
        console.error('PiP Error:', error);
      }
    }
  }));

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {isDirectVideo ? (
        <video
          ref={videoRef}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          className="h-full w-full object-contain"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          autoPlay
        />
      ) : (
        <iframe
          title="Nonton-Yuk video player"
          src={url || undefined}
          className="h-full w-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
});

Player.displayName = 'Player';
export default Player;
