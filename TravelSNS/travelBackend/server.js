// server.js
// IPv4 を優先して DNS 解決させる（重要）
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./src/model');

// .envファイルから環境変数を読み込む
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 画像配信設定
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB接続と同期
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log("DB接続完了。テーブルを同期しました。");
    })
    .catch((err) => {
        console.error("DB接続エラー: " + err.message);
    });

// ルート設定
require('./src/route/AuthRoutes')(app);
require('./src/route/PostRoutes')(app);
require('./src/route/ProfileRoutes')(app);
require('./src/route/UserRoutes')(app);
require('./src/route/SearchRoutes')(app);
require('./src/route/MimicRoutes')(app);
require('./src/route/TagRoutes')(app);
require('./src/route/RecommendationRoutes')(app);
require('./src/route/RecommendationRoutes')(app);
// Mount Nominatim first (specific path /api/proxy/nominatim)
require('./src/route/NominatimRoutes')(app);
// Mount Nominatim first (specific path /api/proxy/nominatim)
require('./src/route/NominatimRoutes')(app);
// Mount Yahoo Proxy (general path /api/proxy)
require('./src/route/ProxyRoutes')(app);
// Upload Routes
require('./src/route/UploadRoutes')(app);

// ルートエンドポイント
app.get('/', (req, res) => {
    res.send('旅ルート共有アプリのバックエンドが動作中です！(MySQL版)');
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーはポート ${PORT} で動作しています`);
});

