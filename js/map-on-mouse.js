const popup = new mapboxgl.Popup({closeButton: false, closeOnClick: false});

export default () => {
	map.on('mouseenter', 'network-points-layer', (e) => {
		map.getCanvas().style.cursor = 'pointer';
		const coordinates = e.features[0].geometry.coordinates.slice();
		const nameProperty = e.features[0].properties.name;
		const imageLink = e.features[0].properties.image;
		const popupContent = `
						<div class="popup-image-container">
								<h3>${nameProperty}</h3>
								<!--<img src="${imageLink}" alt="Image" class="popup-image"> uncomment once images exist in img folder-->
						</div>`;
		popup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
	});

	map.on('mouseleave', 'network-points-layer', () => {
		map.getCanvas().style.cursor = '';
		popup.remove();
	});
};
