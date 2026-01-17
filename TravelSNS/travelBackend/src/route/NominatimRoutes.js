const express = require('express');
const axios = require('axios');
const https = require('https');
const dns = require('dns');
const router = express.Router();

// ---------------------------------------------------------
// Network Configuration: Force IPv4
// ---------------------------------------------------------
try {
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
} catch (e) {
    // Ignore if not supported
}

// Create an HTTPS agent that enforces IPv4 (family: 4)
const ipv4Agent = new https.Agent({
    family: 4,
    keepAlive: true
});

// Cache & rate limiting
const cache = new Map();
const CACHE_TTL = 3600 * 1000;
let lastRequestTime = 0;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json([]);

    if (cache.has(q)) {
        const { data, timestamp } = cache.get(q);
        if (Date.now() - timestamp < CACHE_TTL) return res.json(data);
        cache.delete(q);
    }

    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < 1000) await sleep(1000 - timeSinceLast);
    lastRequestTime = Date.now();

    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q, format: 'json', addressdetails: 1, limit: 5 },
            headers: { 'User-Agent': 'TravelSnsApp/1.0 (hirose060306@gmail.com)' },
            httpsAgent: ipv4Agent,
            timeout: 10000
        });

        cache.set(q, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        console.error("Nominatim API Error:", error.message);
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
});

// Reverse Geocoding Endpoint
router.get('/reverse', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });

    // Internal Cache Key for Reverse
    const cacheKey = `REV:${lat},${lon}`;

    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (Date.now() - timestamp < CACHE_TTL) return res.json(data);
        cache.delete(cacheKey);
    }

    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < 1000) await sleep(1000 - timeSinceLast);
    lastRequestTime = Date.now();

    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat,
                lon,
                format: 'json',
                addressdetails: 1
            },
            headers: { 'User-Agent': 'TravelSnsApp/1.0 (hirose060306@gmail.com)' },
            httpsAgent: ipv4Agent,
            timeout: 10000
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        console.error("Nominatim Reverse API Error:", error.message);
        res.status(500).json({ message: 'Reverse Geocoding failed', error: error.message });
    }
});

module.exports = (app) => {
    // Mount specifically to /api/proxy/nominatim
    app.use('/api/proxy/nominatim', router);
};
