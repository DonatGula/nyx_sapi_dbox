import Link from 'next/link';

export default function MovieCard({ item, isDark }) {
  return (
    <Link href={`/detail/${encodeURIComponent(item.detailPath)}`}>
      <div className={`group relative rounded-[1rem] overflow-hidden border-2 transition-all duration-500 cursor-pointer 
        ${isDark 
          ? 'bg-[#111114] border-white/5 hover:border-[#FF2D85] shadow-2xl' 
          : 'bg-white border-white hover:border-[#FF2D85] shadow-[8px_8px_0px_rgba(255,45,133,0.1)] hover:shadow-none'
        }`}
      >
        {/* Poster/Cover */}
        <div className="aspect-[2/3] overflow-hidden relative">
          <img 
            src={item.poster} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            loading="lazy"
          />
          
          {/* Badge Rating & Type - Floating Style */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
             <span className="bg-[#FF2D85] text-white text-[9px] font-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000] uppercase italic tracking-tighter">
                {item.type || 'NEW'}
             </span>
          </div>

          <div className="absolute top-4 right-4">
             <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                ★ {item.rating || '0.0'}
             </span>
          </div>
        </div>

        {/* Info Area */}
        <div className={`p-5 transition-colors ${isDark ? 'bg-[#16161a]' : 'bg-white'}`}>
          <h3 className={`text-[11px] font-black uppercase italic tracking-tighter line-clamp-2 leading-tight group-hover:text-[#FF2D85] transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {item.title}
          </h3>
          
          <div className="flex justify-between items-center mt-3">
             <p className="text-[11px] font-bold text-pink-500/50 uppercase">{item.year || '2026'}</p>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all group-hover:bg-[#FF2D85] group-hover:border-[#FF2D85] group-hover:text-white ${isDark ? 'border-white/10 text-white/20' : 'border-pink-100 text-pink-200'}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}