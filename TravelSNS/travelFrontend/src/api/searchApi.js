import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const searchLocal = async (params) => {
    try {
        const response = await axios.get(`${API_URL}/search/local`, { params });
        return response.data;
    } catch (error) {
        console.error("Local Search API Error:", error);
        throw error;
    }
};

export const searchAddress = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/search/geo`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error("Geocoder API Error:", error);
        throw error;
    }
};

// Reverse Geocode (Lat/Lon -> Address)
export const reverseGeocode = async (lat, lon) => {
    try {
        const response = await axios.get(`${API_URL}/search/reverse-geo`, {
            params: { lat, lon }
        });
        return response.data;
    } catch (error) {
        console.error("Reverse Geocoder API Error:", error);
        throw error;
    }
};

// Place Info (Lat/Lon -> Landmark Name)
export const getPlaceInfo = async (lat, lon) => {
    try {
        const response = await axios.get(`${API_URL}/search/place-info`, {
            params: { lat, lon }
        });
        return response.data;
    } catch (error) {
        console.error("Place Info API Error:", error);
        throw error;
    }
};
