import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import MovieCard from '../components/MovieCard';

const TABS = [
  { id: 'favorites', label: 'Favorites' },
  { id: 'trending', label: 'Trending' },
  { id: 'indonesian-movies', label: 'Indonesia' },
  { id: 'indonesian-drama', label: 'Drama Indonesia' },
  { id: 'kdrama', label: 'K-Drama' },
  { id: 'short-tv', label: 'Short TV' },
  { id: 'anime', label: 'Anime' },
];

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const loadData = useCallback(async (action, pageNum = 1, query = '', append = false) => {
    if (action === 'favorites') {
      const favorites = JSON.parse(localStorage.getItem('movieFavorites')) || {};
      const favItems = Object.values(favorites).sort((a, b) => b.timestamp - a.timestamp);
      setItems(favItems);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = `/api/movies?action=${action}&page=${pageNum}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        setItems(prevItems => append ? [...prevItems, ...data.items] : data.items);
        setHasMore(true);
      } else {
        if (!append) setItems([]);
        setHasMore(false);
      }
    } catch (err) {
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for changing tab or initial load
  useEffect(() => {
    if (!search) {
      setCurrentPage(1);
      setHasMore(true);
      setHeroIndex(0);
      loadData(activeTab, 1, '', false);
    }
  }, [activeTab, search]);

  // Load History
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('movieHistory')) || {};
    const sortedHistory = Object.values(history)
      .filter(item => item.title && item.poster) // Only show items with valid metadata
      .sort((a, b) => b.timestamp - a.timestamp);
    setHistoryItems(sortedHistory);
  }, []);

  // Effect for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search) {
        setCurrentPage(1);
        setHasMore(true);
        loadData('search', 1, search, false);
      }
    }, 500); // Debounce search
    return () => clearTimeout(handler);
  }, [search]);

  // Hero Slider Logic
  useEffect(() => {
    let interval;
    if (activeTab === 'trending' && !search && items.length > 0) {
      interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % Math.min(items.length, 5));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, search, items]);

  // Scroll listener for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadData(activeTab, nextPage, search, true);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your viewing history? This action cannot be undone.')) {
      localStorage.removeItem('movieHistory');
      setHistoryItems([]);
    }
  };

  const clearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all your favorites? This action cannot be undone.')) {
      localStorage.removeItem('movieFavorites');
      if (activeTab === 'favorites') {
        setItems([]);
      }
    }
  };

  const heroItem = (!search && activeTab === 'trending' && items.length > 0) ? items[heroIndex] : null;
  
  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#101010] text-white' : 'bg-gray-100 text-black'}`}>
      <Head>
        <title>Nonton-Yuk | Movie & Series</title>
        <meta name="description" content="Streaming film dan series terlengkap dengan subtitle Indonesia." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* STICKY NAVBAR - YouTube Style */}
      <nav className={`fixed top-0 w-full z-50 transition-colors ${isDark ? 'bg-[#101010]/80 backdrop-blur-lg border-b border-white/5' : 'bg-white/80 backdrop-blur-lg border-b border-gray-200'}`}>
        <div className="mx-auto flex items-center justify-between gap-4 p-3 px-6">
          {/* Left Side: Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img src="/logo/logo.webp" alt="Nonton-Yuk Logo" className="h-8 w-auto filter drop-shadow-[0_0_3px_#FF2D85]" />
            <h1 className="text-xl font-semibold tracking-tighter hidden sm:block">
              Nonton<span className="text-[#FF2D85]">-</span>Yuk
            </h1>
          </Link>
            
          {/* Center: Search Bar */}
          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-lg group">
              <input 
                type="text" 
                placeholder="Search..." 
                className={`w-full rounded-full px-5 py-2.5 text-sm outline-none transition-all border ${isDark ? 'bg-white/5 border-white/10 focus:border-pink-500 focus:bg-white/10' : 'bg-gray-200 border-gray-300 focus:border-pink-500'}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className={`absolute right-0 top-0 h-full flex items-center pr-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
              </span>
            </div>
          </div>
         
          {/* Right Side: Actions */}
          <div className="flex items-center gap-3 shrink-0">
             <a href='/komik' target='_blank' rel='noopener noreferrer' className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
               Manga
            </a>
            <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2.5 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
                {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* HERO BANNER SLIDER */}
        {heroItem && (
            <div className="relative w-full h-[50vh] md:h-[70vh] mb-8 overflow-hidden group">
                <div className="absolute inset-0 transition-opacity duration-1000">
                    <img src={heroItem.poster} alt={heroItem.title} className="w-full h-full object-cover object-top opacity-60 blur-sm scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#101010] via-[#101010]/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-4xl z-10">
                    <span className="px-3 py-1 bg-pink-600 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-4 inline-block animate-pulse">Trending Now</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight drop-shadow-lg line-clamp-2">{heroItem.title}</h1>
                    <div className="flex items-center gap-4 text-sm md:text-base font-medium text-gray-300 mb-6">
                        <span>{heroItem.year}</span>
                        <span>•</span>
                        <span className="text-yellow-500">★ {heroItem.rating}</span>
                        <span>•</span>
                        <span>{heroItem.type}</span>
                    </div>
                    <Link href={`/detail/${encodeURIComponent(heroItem.detailPath)}`}>
                        <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-transform hover:scale-105 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                            Watch Now
                        </button>
                    </Link>
                </div>
                {/* Slider Indicators */}
                <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                    {[...Array(Math.min(items.length, 5))].map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'w-8 bg-pink-500' : 'w-2 bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* SCROLLABLE TAB SELECTOR - YouTube Chip Style */}
        {!search && (
          <div className={`sticky top-[72px] z-40 py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 transition-colors ${isDark ? 'bg-[#101010]/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <div className="flex gap-3 overflow-x-auto no-scrollbar justify-start md:justify-center">
              {TABS.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    activeTab === tab.id 
                    ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                    : (isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-gray-200 text-black hover:bg-gray-300')
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 sm:px-6 lg:px-8">

        {/* CONTINUE WATCHING SECTION */}
        {!search && historyItems.length > 0 && (
          <div className="py-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Continue Watching</h2>
              <button 
                onClick={clearHistory}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-black'}`}
              >
                Clear History
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {historyItems.slice(0, 12).map((item, index) => (
                <div key={index} className="w-44 flex-shrink-0">
                  <MovieCard item={item} isDark={isDark} />
                  <div className={`mt-2 text-xs font-medium truncate ${isDark ? 'text-pink-500' : 'text-pink-600'}`}>
                    S{item.seasonIndex + 1} E{item.episodeNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Title / Search Status */}
        {!search ? (
            <div className="flex items-center justify-between pt-8 pb-4 px-1">
                <h2 className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                {activeTab === 'favorites' && items.length > 0 && (
                    <button 
                        onClick={clearFavorites}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-black'}`}
                    >
                        Clear Favorites
                    </button>
                )}
            </div>
        ) : (
          <div className="py-6">
            <h2 className={`text-lg font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Results for: <span className={`${isDark ? 'text-white' : 'text-black'} font-medium`}>"{search}"</span>
            </h2>
          </div>
        )}

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {loading && items.length === 0 ? (
             [...Array(12)].map((_, i) => (
               <div key={i}>
                  <div className={`aspect-[2/3] w-full rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
               </div>
             ))
          ) : items.length > 0 ? (
            items.map((item, index) => (
              <MovieCard key={`${item.id}-${index}`} item={item} isDark={isDark} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className={`text-lg font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {activeTab === 'favorites' ? "You haven't added any favorites yet." : 'No results found.'}
              </p>
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className={`mt-4 px-6 py-2 rounded-full font-semibold transition-transform hover:scale-105 ${isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-black'}`}
                >
                  Back to Home
                </button>
              )}
            </div>
          )}
        </div>

        {/* LOAD MORE BUTTON */}
        {!loading && hasMore && items.length > 0 && (
          <div className="text-center py-10">
            <button 
              onClick={loadMore}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Load More
            </button>
          </div>
        )}
        
        {loading && items.length > 0 && (
            <div className="text-center py-10 text-sm text-gray-500">Loading...</div>
        )}

        </div>
      </main>

      {/* BACK TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all duration-300 z-50 ${isDark ? 'bg-pink-600 text-white hover:bg-pink-500' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: ${isDark ? '#101010' : '#F9F9F9'}; }
      `}</style>
    </div>
  );
}