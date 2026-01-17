import React, { useState } from "react";
import LeafletMap from "../map/LeafletMap";

async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=jp&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length === 0) return null;

    return {
        lat: data[0].lat,
        lon: data[0].lon,
    };
}

const LocationSearch = () => {
    const [address, setAddress] = useState("");
    const [coords, setCoords] = useState(null);

    const searchLocation = async () => {
        const result = await geocode(address);
        if (result) {
            setCoords(result);
        } else {
            alert("場所が見つかりませんでした");
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="住所や場所名を入力"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button onClick={searchLocation}>検索</button>

            {coords && (
                <LeafletMap lat={parseFloat(coords.lat)} lon={parseFloat(coords.lon)} height="300px" />
            )}
        </div>
    );
};

export default LocationSearch;
