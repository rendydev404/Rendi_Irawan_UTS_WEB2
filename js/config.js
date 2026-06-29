/**
 * Konfigurasi koneksi ke Backend API UTSmart.
 *
 * Saat dijalankan di localhost -> otomatis memakai server lokal (port 5000).
 * Saat di-deploy (Vercel/Netlify/Railway) -> ganti nilai PROD_API_URL di bawah
 * dengan Base URL backend Railway kamu, mis. https://utsmart-api.up.railway.app
 */
(function () {
  const PROD_API_URL = 'https://backend-production-e5c6.up.railway.app';

  const host = window.location.hostname;
  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host === '' || host === '0.0.0.0';

  window.API_BASE_URL = isLocal ? 'http://localhost:5000' : PROD_API_URL;
})();
