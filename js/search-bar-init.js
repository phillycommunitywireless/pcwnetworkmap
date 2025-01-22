import { FlyToDefaults } from './const.js';
import debounce from './util/debounce.lodash.js';
import geocoding from './util/geocoding.js';

// Unless you jump thru hoops to change the docker instance to use HTTPS,
// you won't be able to test this locally as geolocation requires it
// the geocoding API will work if you paste the URL manually, but not from localhost

/**
 * @param {{
 * 	latitude: number;
 * 	longitude: number;
 * }} param0
 * @returns {Map}
 */
const navigateTo = ({latitude, longitude}) => {
	const center = [longitude, latitude];
	map.flyTo({
		...FlyToDefaults,
		center,
	});
	const marker = new mapboxgl.Marker();
	marker.setLngLat(center).addTo(map);
	setTimeout(() => marker.remove(), 5000);
};

const tryToFindUser = () => {
	/**
	 * @type {PositionErrorCallback}
	 */
	function success({coords}) {
		navigateTo(coords);
	}
	/**
	 * @type {PositionErrorCallback}
	 */
	function error(e) {
		// PERMISSION_DENIED: 1; POSITION_UNAVAILABLE: 2; TIMEOUT: 3;
		console.error('Unable to retrieve your location', e);
		alert('Unable to process location');
	}

	navigator.geolocation.getCurrentPosition(success, error);
};

/**
 * @param {Event} param0
 */
const handleUserSearch = async (e) => {
	e.preventDefault();
	const {target: {value}} = e;
	const errorEl = document.getElementById('search-bar-error');
	errorEl.style.opacity = '0';

	if (!value) return;

	/**
	 * @type {GeocodingResponse}
	 */
	const res = await geocoding.singleRecordGeocode({address: value});
	if (res) {
		navigateTo(res);
	} else {
		errorEl.style.opacity = '1';
		setTimeout(() => {
			errorEl.style.opacity = '0';
		}, 5000);
	}
};

const DEBOUNCE_MS = 500;
export default () => {
	const containerEl = document.getElementById('search-bar-container');
	const inputEl = containerEl.querySelector('input');
	const locateBtn = containerEl.querySelector('button');

	locateBtn.addEventListener('click', tryToFindUser);
	inputEl.addEventListener('input', debounce(handleUserSearch, DEBOUNCE_MS));
};
