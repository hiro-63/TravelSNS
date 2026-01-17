# TravelSNS（開発中）

このアプリは「旅のルート・写真・思い出を共有する SNS」です。  
現在は **ログイン・新規登録・投稿機能のみ動作**しています。  
その他の機能は順次開発予定です。

---

##  開発状況（Progress）

###  完成済み
- ユーザー登録
- ログイン
- 投稿作成（画像アップロード対応）

###  開発中
- プロフィール編集
- 投稿検索
- タグ機能
- おすすめ投稿
- コメント機能
- 通知機能

---

## 🧪 現在動作する API

- `POST /api/auth/register` – 新規登録  
- `POST /api/auth/login` – ログイン  
- `POST /api/posts` – 投稿作成  

---

## 🚀 セットアップ方法

### 1. リポジトリをダウンロード
#### Git を使う場合 ```bash git clone https://github.com/hiro-63/TravelSNS.git

### 2. MySQL の準備
#### データベース作成 CREATE DATABASE travel;
#### 必要に応じてユーザー権限を付与
GRANT ALL PRIVILEGES ON travel.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

### 3. .env を backend フォルダに作成
#### backend/.env を新規作成し、以下を貼り付けてください。
#### ⚠ 以下はダミー値です。実際の環境に合わせて書き換えてください。
PORT=5000
##### MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=travel
##### JWT Secret
JWT_SECRET=your_secret_key_here
##### Yahoo API Client ID
YAHOO_CLIENT_ID=your_yahoo_client_id_here

### 4. バックエンドのセットアップ
##### cd backend
##### npm install
##### npm run dev

### 5. フロントエンドのセットアップ
##### cd frontend
##### npm install
##### npm start

---

## 🗺 今後のロードマップ

- [ ] プロフィール編集  
- [ ] 投稿検索  
- [ ] タグ機能  
- [ ] ルート検索  
- [ ] おすすめ投稿  
- [ ] コメント機能  
- [ ] 通知機能  
- [ ] デプロイ  

---

## 📝 注意事項
このプロジェクトは開発中のため、予告なく仕様が変更される場合があります。
