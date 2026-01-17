const express = require('express');
const router = express.Router();
const axios = require('axios');

module.exports = (app) => {
    // Define the route on the router
    router.get('/yahoo-local-search', async (req, res) => {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: 'Query parameter is required' });

        try {
            const yahooClientId = process.env.YAHOO_CLIENT_ID;
            if (!yahooClientId) return res.status(500).json({ message: 'Server configuration error' });

            const response = await axios.get(`https://map.yahooapis.jp/search/local/V1/localSearch`, {
                params: {
                    appid: yahooClientId,
                    query: encodeURIComponent(query),
                    output: 'json'
                }
            });

            const features = response.data.Feature || [];
            const suggestions = features.map(f => ({
                name: f.Name,
                address: f.Property?.Address,
                lat: parseFloat(f.Geometry.Coordinates.split(',')[1]),
                lon: parseFloat(f.Geometry.Coordinates.split(',')[0]),
            }));

            res.json(suggestions);
        } catch (error) {
            console.error("Yahoo API Proxy Error:", error.message);
            res.status(500).json({ message: 'Failed to fetch suggestions from Yahoo API' });
        }
    });

    // Mount at /api/proxy.
    // Note: To avoid conflict with /api/proxy/nominatim, ensure Nominatim is registered
    // separately or this router only matches /yahoo-local-search.
    app.use('/api/proxy', router);
};
