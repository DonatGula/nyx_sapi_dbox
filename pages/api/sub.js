import axios from 'axios';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("No URL");

  try {
    const response = await axios.get(url, { responseType: 'text' });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/vtt'); 
    
    const vttData = "WEBVTT\n\n" + response.data.replace(/,/g, '.');
    res.status(200).send(vttData);
  } catch (e) {
    res.status(500).send("Error bypass subtitle");
  }
}