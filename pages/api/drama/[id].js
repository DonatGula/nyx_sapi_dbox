import axios from 'axios';

export default async function handler(req, res) {
  const { id } = req.query; 
  const token = process.env.PLAYSVERSE_TOKEN;

  try {
    const response = await axios.get(`https://playsverse.com/api/playlet/drama/${id}`, {
      params: { 'language': 'in' },
      headers: {
        'Authorization': token,
        'clientId': '8aaa2824912e16e799e82203b89668df',
        'User-Agent': 'okhttp/4.12.0',
        'appId': '2001',
        'Accept': 'application/json',
      }
    });

    const drama = response.data.data;

    res.status(200).json({
      title: drama.title,
      synopsis: drama.synopsis,
      posterImgUrl: drama.posterImgUrl,
      episodes: drama.episodes.map(ep => ({
        number: ep.episodeNumber,
        video_url: ep.videos[0]?.url || "",
        // AMBIL LINK SUBTITLE DI SINI (biasanya indeks 0 adalah Indonesia)
        subtitle_url: ep.subtitleTracks[0]?.label || "" 
      }))
    });
  } catch (e) {
    res.status(500).json({ err: "Gagal memuat detail" });
  }
}

