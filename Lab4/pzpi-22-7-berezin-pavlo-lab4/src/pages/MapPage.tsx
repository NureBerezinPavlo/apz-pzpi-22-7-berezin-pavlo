import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ElevatorMap from '../components/map/ElevatorMap';
import Header from '../components/layout/Header';

const MapPage: React.FC = () => {
	// Координати центру мапи (можна визначити за першим ліфтом)
	const center: [number, number] = [50.005833, 36.229167]; // Харків

	return (
		<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			<MapContainer center={center} zoom={13} style={{ flex: 1, height: '100%' }}>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
				<ElevatorMap />
			</MapContainer>
		</div>
	);
};

export default MapPage;
