import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map clicks
const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            if (onMapClick) {
                onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
            }
        },
    });
    return null;
};

// Component to fit bounds to route
const FitBounds = ({ points }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
};

const LeafletMap = ({ lat, lon, routePoints = [], height = "300px", onMapClick, zoom = 13, popupContent }) => {
    console.log(routePoints);


    // Determine center: either single point, or first point of route, or default Tokyo
    let center = [35.6812, 139.7671];
    if (lat && lon) {
        center = [lat, lon];
    } else if (routePoints && routePoints.length > 0) {
        center = [routePoints[0].lat, routePoints[0].lon];
    }

    // Prepare route positions for Polyline
    const polylinePositions = routePoints.map(p => [p.lat, p.lon]);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: height, width: "100%", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Single Marker Mode */}
            {(lat && lon && routePoints.length === 0) && (
                <Marker position={[lat, lon]}>
                    <Popup>
                        {popupContent || "Selected Location"}
                    </Popup>
                </Marker>
            )}

            {/* Route Mode */}
            {routePoints.map((point, idx) => (
                <Marker key={idx} position={[point.lat, point.lon]}>
                    <Popup>
                        <div className="text-center">
                            <strong>{idx + 1}. {point.locationName || point.name || "Point"}</strong>
                            {point.description && <p className="text-sm m-0">{point.description}</p>}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {routePoints.length > 1 && (
                <Polyline positions={polylinePositions} color="blue" />
            )}

            {routePoints.length > 0 && <FitBounds points={routePoints} />}

            <MapEvents onMapClick={onMapClick} />
        </MapContainer>
    );
};

export default LeafletMap;