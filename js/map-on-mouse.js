const nodes_to_display = ["RH", "MN"]

// Only allow web images in the popup, never javascript: or data: URLs.
const isWebUrl = (value) => {
	try {
		return ['http:', 'https:'].includes(new URL(value, window.location.href).protocol);
	} catch {
		return false;
	}
};

// Popup text comes from the API, so build it with textContent instead of
// injecting it as HTML.
const buildPopupContent = ({ name, image, ap_type, type }) => {
	const container = document.createElement('div');
	container.className = 'popup-image-container';

	const heading = document.createElement('h3');
	heading.textContent = name ?? '';
	container.appendChild(heading);

	// Show an image only if 1) an image exists and 2) the clicked network node is an access point.
	if (image && nodes_to_display.includes(type) && isWebUrl(image)) {
		const img = document.createElement('img');
		img.src = image;
		img.alt = name ? `Photo of ${name}` : 'Photo of network node';
		img.className = 'popup-image';
		container.appendChild(img);
	}

	// text that will display under the node name and image (if present)
	if (ap_type) {
		const description = document.createElement('p');
		description.textContent = ap_type;
		container.appendChild(description);
	}

	return container;
};

export default () => {
	map.on('mouseenter', 'network-points-layer', () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'network-points-layer', () => {
		map.getCanvas().style.cursor = '';
	});

	map.on('click', 'network-points-layer', (e) => {
		// Mapbox reports a feature as MultiPoint only when it has several positions (older exports used MultiPoint); LngLat.convert rejects a nested array, so anchor the popup at the first position.
		const geometry = e.features[0].geometry;
		const coordinates = (geometry.type === 'MultiPoint' ? geometry.coordinates[0] : geometry.coordinates).slice();

		let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: true })
			.setLngLat(coordinates)
			.setDOMContent(buildPopupContent(e.features[0].properties))
			.addTo(map);
		popup.getElement().style.opacity = "1"
	});
};
