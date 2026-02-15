// pages/_app.js
import '../styles/globals.css' // Pastikan baris ini ada di paling atas!

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp