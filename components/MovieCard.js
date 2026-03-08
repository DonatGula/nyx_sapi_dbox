import Link from 'next/link';

export default function MovieCard({ item, isDark }) {
  const progress = item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;

  return (
    <Link href={`/detail/${encodeURIComponent(item.detailPath)}`} legacyBehavior>
      <a className="group block cursor-pointer relative overflow-hidden rounded-xl">
        <div className="aspect-[2/3] w-full">
          <img 
            src={item.poster} 
            alt={item.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
            loading="lazy"
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Info */}
        <div className="absolute bottom-0 left-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full">
          <h3 className="text-base font-bold text-white leading-tight line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{item.type} &bull; {item.year}</p>
        </div>
        {item.rating && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
            ★ {item.rating}
          </span>
        )}
        {/* Progress Bar for Continue Watching */}
        {progress > 0 && progress < 95 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 backdrop-blur-sm">
            <div
              className="h-full bg-pink-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </a>
    </Link>
  );
}