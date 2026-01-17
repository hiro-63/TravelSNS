const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ディレクトリ作成
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

module.exports = function (app) {
    // 画像アップロードAPI
    app.post('/api/upload', upload.single('image'), (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send({ message: 'No file uploaded' });
            }

            // 公開URLを生成 (server.jsで /uploads を公開している前提)
            // プロトコルとホストはリクエストから取得、または相対パスを返す
            const imageUrl = `/uploads/${req.file.filename}`;

            res.send({ imageUrl: imageUrl });
        } catch (err) {
            console.error('Upload Error:', err);
            res.status(500).send({ message: err.message });
        }
    });
};
