import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Player from '../../components/Player';

export default function AnimeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [anime,setAnime] = useState(null);
  const [episode,setEpisode] = useState(1);
  const [stream,setStream] = useState(null);
  const [mode,setMode] = useState('sub');
  const [server,setServer] = useState(0);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  useEffect(() => {
    if (!id) return;
    fetch('/api/anime?action=detail&id='+encodeURIComponent(id)).then(async r => {
      const j=await r.json(); if(!r.ok || !j.success) throw new Error(j.error || 'Anime tidak ditemukan');
      setAnime(j.data); if(j.data.episodes?.length) setEpisode(j.data.episodes[0].episode);
    }).catch(e=>setError(e.message));
  },[id]);
  async function resolve(ep=episode, audio=mode) {
    if(!anime?.streamSlug) { setError('Sumber streaming untuk judul ini belum ditemukan.'); return; }
    setBusy(true); setError(''); setStream(null); setServer(0);
    try {
      const r=await fetch('/api/anime?action=resolve&slug='+encodeURIComponent(anime.streamSlug)+'&ep='+ep+'&mode='+audio);
      const j=await r.json(); if(!r.ok || !j.success) throw new Error(j.error || 'Gagal mencari server');
      setStream(j.data);
    } catch(e){setError(e.message);} finally{setBusy(false);}
  }
  if(!anime && !error) return <div className="min-h-screen bg-black p-10 text-white">Memuat detail anime...</div>;
  return <div className="min-h-screen bg-[#09090d] text-white">
    <Head><title>{anime?.title || 'Anime'} | Nonton-Yuk</title></Head>
    <header className="border-b border-white/10 px-5 py-4"><div className="mx-auto flex max-w-6xl justify-between"><Link href="/anime" className="font-bold">← Anime</Link><Link href="/" className="text-sm text-gray-400">Beranda</Link></div></header>
    <main className="mx-auto max-w-6xl px-5 py-8">
      {error && <div className="mb-5 rounded-xl bg-red-500/10 p-4 text-red-200">{error}</div>}
      {anime && <><div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <img src={anime.poster} alt={anime.title} className="w-full rounded-xl object-cover md:max-h-[330px]" />
        <section><h1 className="text-3xl font-black">{anime.title}</h1><p className="mt-2 text-sm text-gray-400">{anime.year} · {anime.type} · {anime.status} {anime.rating ? '· ★ '+anime.rating : ''}</p><p className="mt-5 leading-7 text-gray-300">{anime.synopsis || 'Sinopsis belum tersedia.'}</p><div className="mt-4 flex flex-wrap gap-2">{(anime.genres||[]).map(g=><span key={g} className="rounded-full bg-white/10 px-3 py-1 text-xs">{g}</span>)}</div></section>
      </div>
      <section className="mt-9"><h2 className="mb-4 text-xl font-bold">Tonton episode</h2>
        <div className="mb-4 flex flex-wrap items-center gap-3"><select value={mode} onChange={e=>setMode(e.target.value)} className="rounded-lg bg-white/10 p-3"><option value="sub">Subtitle</option><option value="dub">Dub</option></select><select value={episode} onChange={e=>setEpisode(Number(e.target.value))} className="max-w-full rounded-lg bg-white/10 p-3">{(anime.episodes||[]).map(e=><option key={e.episode} value={e.episode}>Episode {e.episode}</option>)}</select><button disabled={busy || !anime.streamSlug} onClick={()=>resolve()} className="rounded-lg bg-pink-600 px-5 py-3 font-semibold disabled:opacity-50">{busy?'Mencari server...':'Putar episode'}</button></div>
        {stream && <><div className="mb-3 aspect-video overflow-hidden rounded-xl bg-black"><Player url={stream.servers?.[server]?.embed || stream.embedUrl} poster={anime.poster} /></div><div className="flex flex-wrap gap-2">{stream.servers?.map((s,i)=><button key={s.embed} onClick={()=>setServer(i)} className={'rounded-lg px-4 py-2 text-sm '+(server===i?'bg-pink-600':'bg-white/10')}>{s.name}</button>)}</div></>}
        {!anime.episodes?.length && <p className="text-sm text-gray-400">Daftar episode HiAnime tidak ditemukan untuk judul ini.</p>}
      </section></>}
    </main>
  </div>;
}
