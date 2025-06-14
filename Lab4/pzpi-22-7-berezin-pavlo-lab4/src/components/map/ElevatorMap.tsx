import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchElevators } from '../../store/elevatorSlice';
import MarkerPopup from './MarkerPopup';
import { FullElevator } from '../../types/types';

// Виправлення проблеми з іконками в Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
	iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const ElevatorMap: React.FC = () => {
	const map = useMap();
	const dispatch = useDispatch<AppDispatch>();
	const { elevators, loading } = useSelector((state: RootState) => state.elevators);

	useEffect(() => {
		dispatch(fetchElevators());
	}, [dispatch]);

	useEffect(() => {
		// Фільтруємо ліфти з валідними координатами
		const validElevators = elevators.filter((e) => e.latitude !== undefined && e.longitude !== undefined);

		if (validElevators.length > 0) {
			const bounds = L.latLngBounds(
				validElevators.map(
					(e) =>
						// assert non-null here, since we filtered out undefined above
						[e.latitude!, e.longitude!] as [number, number]
				)
			);
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [elevators, map]);

	if (loading) return null;

	const validElevators = elevators.filter((e) => e.latitude !== undefined && e.longitude !== undefined) as FullElevator[]; // Вказуємо тип

	return (
		<>
			{validElevators.map((elevator) => (
				<Marker
					key={elevator.id}
					position={[elevator.latitude!, elevator.longitude!]}
					icon={L.icon({
						iconUrl: getIconByStatus(elevator.status),
						iconSize: [40, 61],
						iconAnchor: [12, 41]
					})}
				>
					<Popup>
						<MarkerPopup elevator={elevator} />
					</Popup>
				</Marker>
			))}
		</>
	);
};

// Функція для визначення іконки за статусом
const getIconByStatus = (status: string): string => {
	switch (status) {
		case 'critical':
			return 'markers/marker-red.png';
		case 'maintenance':
			return 'markers/marker-yellow.png';
		default:
			return 'markers/marker-green.png';
	}
};

export default ElevatorMap;
