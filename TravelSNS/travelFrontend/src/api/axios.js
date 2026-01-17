import axios from 'axios';

// BackendのPortに合わせて設定。通常Create-React-Appは3000、Expressは5000など。
// travelBackend/.env によるとPORT=3000だが、Frontendも3000だと衝突する。
// 一般的にBackendをlocalhost:5000等に変更するか、FrontendがProxyする。
// ここではBackendのPortを環境変数またはハードコードで指定する。
// Backendのserver.jsでは PORT = process.env.PORT || 3000 となっている。
// Frontendと競合避けるため、Backendは別ポートで起動することを前提としたいが、
// ひとまずデフォルトでリクエスト投げられるように設定。
// 開発環境では localhost:3000 (Backend) に向ける。(Frontendは別ポートで起動する想定)

const BASE_URL = 'http://localhost:5000/api'; // Backendを5000ポートで起動すると仮定

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// リクエストインターセプター: ローカルストレージからトークンを取得してヘッダーに付与
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-access-token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
