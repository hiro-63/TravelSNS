TravelSNS 旅行の思い出を 地図 × 写真 × コメント で共有できる Web SNS アプリ

プロジェクト概要 TravelSNS は、旅行先で撮影した写真・コメント・位置情報を投稿し、 地図上で旅の記録を共有できる Web アプリケーションです。

・React によるモダンな UI ・Leaflet を使った地図表示 ・Node.js（Express）＋ MySQL（Sequelize）による API サーバー ・認証は JWT を想定

旅行の思い出を視覚的に残し、他のユーザーと共有できるサービスを目指しています。

使用技術（Tech Stack） フロントエンド 分類 技術 フレームワーク React / react-router-dom スタイリング Tailwind CSS HTTP クライアント Axios 地図表示 Leaflet / react-leaflet 状態管理 React Context（AuthContext） バックエンド 分類 技術 ランタイム Node.js フレームワーク Express ORM Sequelize データベース MySQL 認証 JWT（想定）

ディレクトリ構成 フロントエンド（frontend/src/） コード src/ ├── pages/ # 各画面 ├── components/ # UIパーツ ├── layout/ # ルート制御 ├── context/ # 認証状態管理 ├── api/ # API 通信 └── App.js # ルーティング

バックエンド（backend/src/） コード src/ ├── route/ # 各種ルート ├── models/ # DB モデル ├── config/ # DB 設定 └── server.js # エントリーポイント

src/ ├── route/ # 各種ルート ├── models/ # DB モデル ├── config/ # DB 設定 └── server.js # エントリーポイント

主な機能 ・ログイン / 新規登録 ・投稿（写真・コメント・位置情報） ・地図表示（Leaflet） ・住所検索（Nominatim API） ・投稿一覧 / 検索 / プロフィール表示

実行方法 リポジトリ取得 コード git clone https://github.com/hiro-63/TravelSNS.git フロントエンド コード cd frontend npm install npm start バックエンド コード cd backend npm install npm run dev MySQL コード CREATE DATABASE travelsns; .env 例 コード DB_HOST=localhost DB_USER=your_username DB_PASSWORD=your_password DB_NAME=travelsns JWT_SECRET=your_secret_key

今後の改善予定 ・投稿への「いいね」機能 ・コメント機能 ・プロフィール編集機能 ・投稿編集・削除の強化 ・UI のアニメーション追加
