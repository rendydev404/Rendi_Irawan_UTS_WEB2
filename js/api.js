/**
 * Wrapper fetch untuk memanggil Backend API UTSmart.
 * Otomatis menyisipkan header Authorization (Bearer token) jika user sudah login.
 */
const API = {
  get baseUrl() {
    return window.API_BASE_URL || 'http://localhost:5000';
  },

  getToken() {
    return Storage.get(STORAGE_KEYS.TOKEN);
  },

  async request(method, path, body = null, opts = {}) {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';

    const token = API.getToken();
    if (token && opts.auth !== false) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    let res;
    try {
      res = await fetch(API.baseUrl + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new Error('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
    }

    let data = {};
    try {
      data = await res.json();
    } catch (_) {
      /* respons tanpa body JSON */
    }

    if (!res.ok) {
      const message = data.message || `Request gagal (${res.status})`;
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return data;
  },

  get(path, opts) {
    return API.request('GET', path, null, opts);
  },
  post(path, body, opts) {
    return API.request('POST', path, body, opts);
  },
  put(path, body, opts) {
    return API.request('PUT', path, body, opts);
  },
  del(path, opts) {
    return API.request('DELETE', path, null, opts);
  },

  /** Upload file (multipart/form-data). Tidak set Content-Type agar browser isi boundary otomatis. */
  async upload(path, file) {
    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    const token = API.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    let res;
    try {
      res = await fetch(API.baseUrl + path, { method: 'POST', headers, body: formData });
    } catch (err) {
      throw new Error('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
    }

    let data = {};
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      const error = new Error(data.message || `Upload gagal (${res.status})`);
      error.status = res.status;
      throw error;
    }
    return data;
  },
};
