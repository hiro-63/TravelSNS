const axios = require('axios');

module.exports = function (app) {
    app.get('/api/search/local', async (req, res) => {
        try {
            const appId = process.env.YAHOO_CLIENT_ID;
            if (!appId) {
                return res.status(500).send({ message: "Yahoo Client ID not configured" });
            }

            // Construct query parameters
            const yahooApiUrl = 'https://map.yahooapis.jp/search/local/V1/localSearch';

            // Extract standard parameters from request
            const params = {
                appid: appId,
                output: 'json',
                ...req.query // Pass through all query parameters from frontend
            };

            // Remove device parameter if not explicitly set (or handle as needed)
            // Yahoo API documentation recommends 'device=mobile' for mobile apps
            // We'll let frontend decide by passing it in req.query if needed.

            const response = await axios.get(yahooApiUrl, { params });

            res.send(response.data);
        } catch (error) {
            console.error("Yahoo API Error:", error.response ? error.response.data : error.message);
            res.status(500).send({
                message: "Error fetching data from Yahoo API",
                error: error.message
            });
        }
    });

    // Geocoder API Endpoint
    app.get('/api/search/geo', async (req, res) => {
        try {
            const appId = process.env.YAHOO_CLIENT_ID;
            if (!appId) {
                return res.status(500).send({ message: "Yahoo Client ID not configured" });
            }

            const yahooGeoUrl = 'https://map.yahooapis.jp/geocode/V1/geoCoder';

            const params = {
                appid: appId,
                output: 'json',
                ...req.query
            };

            const response = await axios.get(yahooGeoUrl, { params });
            res.send(response.data);
        } catch (error) {
            console.error("Yahoo Geocoder API Error:", error.response ? error.response.data : error.message);
            res.status(500).send({
                message: "Error fetching data from Yahoo Geocoder API",
                error: error.message
            });
        }
    });

    // Reverse Geocoder Proxy
    app.get("/api/search/reverse-geo", async (req, res) => {
        try {
            const appId = process.env.YAHOO_CLIENT_ID;
            if (!appId) {
                return res.status(500).send({ message: "Yahoo Client ID not configured" });
            }

            const { lat, lon } = req.query;
            if (!lat || !lon) return res.status(400).send({ message: "Lat and Lon are required" });

            const yahooRes = await axios.get(`https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder`, {
                params: {
                    appid: appId,
                    lat: lat,
                    lon: lon,
                    output: 'json'
                }
            });
            res.send(yahooRes.data);
        } catch (err) {
            console.error("Reverse Geocoder API Error:", err.response ? err.response.data : err.message);
            res.status(500).send({
                message: "Failed to fetch from Yahoo API",
                error: err.message
            });
        }
    });

    // Place Info API Proxy
    app.get("/api/search/place-info", async (req, res) => {
        try {
            const appId = process.env.YAHOO_CLIENT_ID;
            if (!appId) {
                return res.status(500).send({ message: "Yahoo Client ID not configured" });
            }

            const { lat, lon } = req.query;
            if (!lat || !lon) return res.status(400).send({ message: "Lat and Lon are required" });

            const yahooRes = await axios.get(`https://map.yahooapis.jp/placeinfo/V1/get`, {
                params: {
                    appid: appId,
                    lat: lat,
                    lon: lon,
                    output: 'json'
                }
            });
            res.send(yahooRes.data);
        } catch (err) {
            console.error("Place Info API Error:", err.response ? err.response.data : err.message);
            res.status(500).send({
                message: "Failed to fetch from Yahoo Place Info API",
                error: err.message
            });
        }
    });
};
