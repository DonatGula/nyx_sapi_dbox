import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Player from '../../components/Player';
import MovieCard from '../../components/MovieCard';

export default function DetailPage() {
  const router = useRouter();
  const { path } = router.query;
  const [movie, setMovie] = useState(null);
  const [activeVideo, setActiveVideo] = useState('');
  const [currentEp, setCurrentEp] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true); // Default Dark Mode
  const [activeSeason, setActiveSeason] = useState(0); // Index season yang aktif
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [episodesVisible, setEpisodesVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [watchedEpisodes, setWatchedEpisodes] = useState({});
  const [cinemaMode, setCinemaMode] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const playerRef = useRef(null);
  const lastUpdateTime = useRef(0);

  const saveHistory = useCallback((dataToSave) => {
    if (!path || !movie) return;
    try {
      const history = JSON.parse(localStorage.getItem('movieHistory')) || {};
      const existingData = history[path] || {};
      
      history[path] = {
        ...existingData,
        title: movie.title,
        poster: movie.poster,
        type: movie.type,
        detailPath: path,
        timestamp: Date.now(),
        ...dataToSave
      };
      localStorage.setItem('movieHistory', JSON.stringify(history));
    } catch (error) {}
  }, [path, movie]);

  const markAsWatched = useCallback((seasonIndex, episodeNumber) => {
    if (episodeNumber === null) return;
    const seasonKey = `season_${seasonIndex}`;
    
    setWatchedEpisodes(prevWatched => {
        const isAlreadyWatched = prevWatched[seasonKey]?.includes(episodeNumber);
        if (isAlreadyWatched) return prevWatched;

        const newWatchedForSeason = [...(prevWatched[seasonKey] || []), episodeNumber];
        const newWatchedState = { ...prevWatched, [seasonKey]: newWatchedForSeason };

        try {
            const allWatchedData = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
            allWatchedData[path] = newWatchedState;
            localStorage.setItem('watchedEpisodes', JSON.stringify(allWatchedData));
        } catch (error) {}
        
        return newWatchedState;
    });
  }, [path]);

  const toggleWatched = useCallback((seasonIndex, episodeNumber) => {
    const seasonKey = `season_${seasonIndex}`;

    setWatchedEpisodes(prevWatched => {
        const currentSeasonWatched = prevWatched[seasonKey] || [];
        const episodeIdx = currentSeasonWatched.indexOf(episodeNumber);
        
        const newSeasonWatched = episodeIdx > -1 
            ? currentSeasonWatched.filter(ep => ep !== episodeNumber) // Unwatch
            : [...currentSeasonWatched, episodeNumber]; // Watch

        const newWatchedState = { ...prevWatched, [seasonKey]: newSeasonWatched };

        try {
            const allWatchedData = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
            allWatchedData[path] = newWatchedState;
            localStorage.setItem('watchedEpisodes', JSON.stringify(allWatchedData));
        } catch (error) {}

        return newWatchedState;
    });
  }, [path]);

  const handleNextEpisode = useCallback(() => {
    // Mark the episode that just finished as watched
    if (currentEp !== null) {
      markAsWatched(activeSeason, currentEp);
    }

    const episodes = movie?.seasons?.[activeSeason]?.episodes;
    if (!episodes) return;
    
    const currentEpIndex = episodes.findIndex(ep => ep.episode === currentEp);
    const nextEpIndex = currentEpIndex + 1;
    
    // Check if there is a next episode in the current season
    if (nextEpIndex < episodes.length) {
      const nextEp = episodes[nextEpIndex];
      setActiveVideo(nextEp.playerUrl);
      setCurrentEp(nextEp.episode);
      saveHistory({
        seasonIndex: activeSeason,
        episodeNumber: nextEp.episode,
        currentTime: 0, duration: 0 // Reset progress
      });
    } 
    // If not, check if there is a next season
    else if (activeSeason < (movie?.seasons?.length || 0) - 1) {
      const nextSeason = activeSeason + 1;
      const firstEpNextSeason = movie.seasons[nextSeason].episodes[0];
      setActiveSeason(nextSeason);
      setActiveVideo(firstEpNextSeason.playerUrl);
      setCurrentEp(firstEpNextSeason.episode);
      saveHistory({
        seasonIndex: nextSeason,
        episodeNumber: firstEpNextSeason.episode,
        currentTime: 0, duration: 0 // Reset progress
      });
    }
  }, [movie, activeSeason, currentEp, saveHistory, markAsWatched]);

  const handlePreviousEpisode = useCallback(() => {
    const episodes = movie?.seasons?.[activeSeason]?.episodes;
    if (!episodes) return;
    
    const prevEpIndex = episodes.findIndex(ep => ep.episode === currentEp) - 1;
    
    // Check if there is a previous episode in the current season
    if (prevEpIndex >= 0) {
      const prevEp = episodes[prevEpIndex];
      setActiveVideo(prevEp.playerUrl);
      setCurrentEp(prevEp.episode);
      saveHistory({
        seasonIndex: activeSeason,
        episodeNumber: prevEp.episode,
        currentTime: 0, duration: 0
      });
    } 
    // If not, check if there is a previous season
    else if (activeSeason > 0) {
      const prevSeasonIndex = activeSeason - 1;
      const prevSeasonEpisodes = movie.seasons[prevSeasonIndex].episodes;
      const lastEpOfPrevSeason = prevSeasonEpisodes[prevSeasonEpisodes.length - 1];
      setActiveSeason(prevSeasonIndex);
      setActiveVideo(lastEpOfPrevSeason.playerUrl);
      setCurrentEp(lastEpOfPrevSeason.episode);
      saveHistory({
        seasonIndex: prevSeasonIndex,
        episodeNumber: lastEpOfPrevSeason.episode,
        currentTime: 0, duration: 0
      });
    }
  }, [movie, activeSeason, currentEp, saveHistory]);

  const handleEpisodeSelect = useCallback((episode) => {
    setActiveVideo(episode.playerUrl);
    setCurrentEp(episode.episode);
    saveHistory({
      seasonIndex: activeSeason,
      episodeNumber: episode.episode,
      currentTime: 0, duration: 0
    });
  }, [activeSeason, saveHistory]);

  const handleTimeUpdate = useCallback((e) => {
    const now = Date.now();
    if (now - lastUpdateTime.current < 5000) return; // Throttle to 5s
    lastUpdateTime.current = now;

    const { currentTime, duration } = e.target;
    if (duration > 0) saveHistory({ currentTime, duration });
  }, [saveHistory]);

  const toggleFavorite = useCallback(() => {
    if (!movie || !path) return;
    try {
      const favorites = JSON.parse(localStorage.getItem('movieFavorites')) || {};
      if (favorites[path]) {
        delete favorites[path];
        setIsFavorite(false);
      } else {
        favorites[path] = {
          title: movie.title,
          poster: movie.poster,
          type: movie.type,
          detailPath: path,
          timestamp: Date.now()
        };
        setIsFavorite(true);
      }
      localStorage.setItem('movieFavorites', JSON.stringify(favorites));
    } catch (e) {}
  }, [movie, path]);

  useEffect(() => {
    if (path) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/movies?action=detail&detailPath=${encodeURIComponent(path)}`);
          const json = await res.json();
          if (json.success && json.data) {
            setMovie(json.data);

            // Default to first episode
            let initialVideo = json.data.playerUrl;
            let initialEp = null;
            let initialSeason = 0;
            const firstEp = json.data.seasons?.[initialSeason]?.episodes?.[0];
            if (firstEp) {
              initialVideo = firstEp.playerUrl;
              initialEp = firstEp.episode;
            }

            // Check for and apply history
            try {
              const history = JSON.parse(localStorage.getItem('movieHistory')) || {};
              const savedState = history[path];
              const savedEpisode = savedState && json.data.seasons?.[savedState.seasonIndex]?.episodes.find(ep => ep.episode === savedState.episodeNumber);
              if (savedEpisode) {
                initialVideo = savedEpisode.playerUrl;
                initialEp = savedEpisode.episode;
                initialSeason = savedState.seasonIndex;
              }
              // Load watched episodes for this movie
              const watchedData = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
              if (watchedData[path]) {
                setWatchedEpisodes(watchedData[path]);
              }
              // Check favorites
              const favorites = JSON.parse(localStorage.getItem('movieFavorites')) || {};
              if (favorites[path]) {
                setIsFavorite(true);
              }
            } catch (e) {}

            setActiveVideo(initialVideo);
            setCurrentEp(initialEp);
            setActiveSeason(initialSeason);
          }
        } catch (err) {} finally { setLoading(false); }
      };
      fetchDetail();
    }
  }, [path]);

  useEffect(() => {
    if (movie) {
      const fetchRelated = async () => {
        setRelatedLoading(true);
        try {
          // Using 'trending' as a generic source for related content.
          const res = await fetch(`/api/movies?action=trending&page=1`);
          const json = await res.json();
          if (json.items) {
            // Filter out the current movie and take up to 10
            const related = json.items.filter(item => item.detailPath !== path).slice(0, 10);
            setRelatedMovies(related);
          }
        } catch (err) {
          // Silent error
        } finally {
          setRelatedLoading(false);
        }
      };
      fetchRelated();
    }
  }, [movie, path]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea to avoid conflicts.
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      // 'n' or 'N' for next episode
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault(); // Prevent default browser action for 'n'
        handleNextEpisode();
      }
      // 'p' or 'P' for previous episode
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePreviousEpisode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextEpisode, handlePreviousEpisode]); // Re-bind if the function changes

  // Check for PiP support on mount
  useEffect(() => {
    setPipSupported(!!document.pictureInPictureEnabled);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
        // Redirect to home with search query
        router.push(`/?q=${encodeURIComponent(search)}`);
    }
  };

  const handlePip = () => {
    playerRef.current?.requestPip();
  };

  const handleReloadPlayer = () => {
    setPlayerKey(prev => prev + 1);
  };

  if (loading || !movie) return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>Loading...</div>
  );

  const episodes = movie?.seasons?.[activeSeason]?.episodes;
  const currentEpIndex = episodes ? episodes.findIndex(ep => ep.episode === currentEp) : -1;
  const hasNextInSeason = episodes && currentEpIndex > -1 && currentEpIndex < episodes.length - 1;
  const hasNextSeason = activeSeason < (movie?.seasons?.length || 0) - 1;
  const hasNextEpisode = hasNextInSeason || (hasNextSeason && movie.seasons[activeSeason + 1]?.episodes?.length > 0);

  const hasPrevInSeason = episodes && currentEpIndex > 0;
  const hasPrevSeason = activeSeason > 0;
  const hasPreviousEpisode = hasPrevInSeason || (hasPrevSeason && movie.seasons[activeSeason - 1]?.episodes?.length > 0);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <Head><title>{movie.title}</title></Head>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-3 flex items-center justify-between transition-colors ${isDark ? 'bg-black/95 border-b border-gray-800' : 'bg-white/95 border-b border-gray-200'} ${cinemaMode ? 'z-0 opacity-20 hover:opacity-100 transition-opacity' : 'z-50'}`}>
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
           <img src="/logo/logo.webp" alt="Logo" className="h-8 w-auto filter drop-shadow-[0_0_3px_#FF2D85]" />
           <span className="font-semibold text-xl tracking-tighter hidden sm:block">Nonton<span className="text-[#FF2D85]">-Yuk</span></span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden sm:block">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="Search movies..." 
                    className={`w-full rounded-full px-4 py-2 text-sm outline-none transition-all border ${isDark ? 'bg-white/5 border-white/10 focus:border-pink-500 focus:bg-white/10' : 'bg-gray-100 border-gray-300 focus:border-pink-500'}`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>
        </div>

        <button onClick={() => setIsDark(!isDark)} className={`p-2.5 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
           {isDark ? '☀️' : '🌙'}
        </button>
      </nav>

      <main className="pt-20 max-w-[1800px] mx-auto px-4 sm:px-6">
         
         {/* Cinema Mode Overlay */}
         {cinemaMode && (
            <div 
                className="fixed inset-0 bg-black/90 z-40 transition-opacity duration-500"
                onClick={() => setCinemaMode(false)}
            />
         )}

         {/* Player Section */}
         <div className={`aspect-video bg-black rounded-xl overflow-hidden shadow-xl relative transition-all duration-500 ${cinemaMode ? 'z-50 scale-105' : 'z-0'}`}>
            <Player key={playerKey} ref={playerRef} url={activeVideo} poster={movie.poster} onEnded={handleNextEpisode} onTimeUpdate={handleTimeUpdate} />
         </div>

         {/* Quick Navigation */}
         <div className={`flex justify-between items-center py-3 mb-4 relative ${cinemaMode ? 'z-50' : ''}`}>
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleReloadPlayer}
                    className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reload
                </button>
                {pipSupported && activeVideo && /\.(mp4|m3u8|webm|ogg)$/i.test(activeVideo) && (
                    <button 
                        onClick={handlePip}
                        className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M18 3H2a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zM9 14H4v-4h5v4z" />
                        </svg>
                        Picture-in-Picture
                    </button>
                )}
            </div>

            <div className="flex gap-2">
            {hasPreviousEpisode && (
                <button
                    onClick={handlePreviousEpisode}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>
            )}
            {hasNextEpisode && (
                <button
                    onClick={handleNextEpisode}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isDark ? 'bg-pink-600 text-white hover:bg-pink-500' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
                >
                    Next 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
            </div>
         </div>

         {/* Episodes Section */}
         <div className="mb-8">
               <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} flex flex-col`}>
                  <div 
                    className="p-4 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0 cursor-pointer lg:cursor-default"
                    onClick={() => setEpisodesVisible(!episodesVisible)}
                  >
                     <h3 className="font-bold">Episodes</h3>
                     <div className="flex items-center gap-2">
                        <select 
                          className={`text-sm p-1 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                          value={activeSeason}
                          onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking select
                          onChange={(e) => setActiveSeason(Number(e.target.value))}
                        >
                           {movie.seasons?.map((s, i) => <option key={i} value={i}>Season {s.season}</option>)}
                        </select>
                        {/* Chevron icon for mobile toggle */}
                        <span className={`lg:hidden transition-transform duration-300 ${episodesVisible ? 'rotate-180' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </span>
                     </div>
                  </div>
                  <div className={`p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto custom-scrollbar max-h-[500px] ${episodesVisible ? 'grid' : 'hidden'} lg:grid`}>
                     {movie.seasons?.[activeSeason]?.episodes.map(ep => {
                        const isWatched = watchedEpisodes[`season_${activeSeason}`]?.includes(ep.episode);
                        return (
                           <div key={ep.episode} className="relative group">
                              <button
                                 onClick={() => handleEpisodeSelect(ep)}
                                 className={`w-full p-3 rounded-lg font-medium transition-colors flex flex-col items-center justify-center gap-1 text-center border ${
                                    currentEp === ep.episode 
                                    ? 'bg-pink-600 border-pink-600 text-white' 
                                    : isWatched
                                    ? (isDark ? 'bg-green-500/10 border-green-500/20 text-white/70' : 'bg-green-500/10 border-green-500/20 text-black/70')
                                    : (isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border-gray-200 hover:bg-gray-200')
                                 }`}
                              >
                                 <span className="text-sm">Episode {ep.episode}</span>
                                 {currentEp === ep.episode && <span className="text-xs font-bold opacity-75">PLAYING</span>}
                              </button>
                              <button
                                 onClick={() => toggleWatched(activeSeason, ep.episode)}
                                 className={`absolute top-1 right-1 z-10 p-0.5 rounded-full transition-all duration-200 ${ isWatched ? 'bg-green-500 text-black opacity-100' : `bg-gray-500/50 text-white/70 opacity-0 group-hover:opacity-100 ${isDark ? 'hover:bg-gray-400/50' : 'hover:bg-gray-600/50'}` }`}
                                 title={isWatched ? "Mark as Unwatched" : "Mark as Watched"}
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                 </svg>
                              </button>
                           </div>
                        );
                     })}
                  </div>
               </div>
         </div>

         {/* Info Section */}
         <div className="mt-4 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm opacity-80">
               <span>{movie.year}</span>
               <span className="px-2 py-0.5 rounded bg-gray-500/20 border border-gray-500/30">{movie.type}</span>
               <span className="text-yellow-500">★ {movie.rating}</span>
            </div>
            <div className="flex flex-wrap gap-4 items-center pt-2">
              {activeVideo && !activeVideo.includes('.m3u8') && (
                  <a
                      href={activeVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Episode
                  </a>
              )}
                <button 
                    onClick={toggleFavorite}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFavorite ? 'bg-pink-600 text-white hover:bg-pink-500' : (isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300')}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
                <button
                    onClick={() => setCinemaMode(!cinemaMode)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${cinemaMode ? 'bg-pink-600 text-white' : (isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300')}`}
                >
                    {cinemaMode ? 'Exit Cinema Mode' : 'Cinema Mode'}
                </button>
            </div>
         </div>

         {/* Related Movies Section */}
         {(relatedLoading || relatedMovies.length > 0) && (
           <div className="mt-12 border-t border-gray-800/50 pt-8">
             <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Related Movies</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
               {relatedLoading ? (
                 [...Array(6)].map((_, i) => (
                   <div key={i}>
                     <div className={`aspect-[2/3] w-full rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                   </div>
                 ))
               ) : ( relatedMovies.map(item => <MovieCard key={item.id} item={item} isDark={isDark} />) )}
             </div>
           </div>
         )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}