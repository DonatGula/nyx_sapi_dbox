// lib/api.js
const BASE_URL = 'https://zeldvorik.ru/apiv3/api.php';

export const fetchFromApi = async (action, params = {}) => {
  const query = new URLSearchParams({ action, ...params }).toString();
  const url = `${BASE_URL}?${query}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal ambil data dari pusat');
  return await res.json();
};