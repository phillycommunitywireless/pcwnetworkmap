// const popup = 
const nodes_to_display = ["RH"]

export default () => {
	map.on('click', 'network-points-layer', (e) => {
		map.getCanvas().style.cursor = 'pointer';
		const coordinates = e.features[0].geometry.coordinates.slice();
		const nameProperty = e.features[0].properties.name;
		const imageLink = e.features[0].properties.image;

		// currently using ap_type as demo for displaying a caption w/ the image 
		// for production deployment, add a new field to API - "image_caption"
		const descriptionText = e.features[0].properties.ap_type

		let popupContent = ``

		// Checks for and displays an image in the network node popup if 1) an image exists and 2) the clicked network node is an access point. 
		if (imageLink && nodes_to_display.includes(e.features[0].properties.type)) {
			popupContent = `
				<div class="popup-image-container">
					<h3>${nameProperty}</h3>
					<img src="${imageLink}" alt="Image" class="popup-image">
					<p>${descriptionText}</p>
				</div>`;

		} else {
			popupContent = `
				<div class="popup-image-container">
					<h3>${nameProperty}</h3>
					<p>${descriptionText}</p>
				</div>`;
		}

		let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: true }).setLngLat(coordinates).setHTML(popupContent).addTo(map);
		popup.getElement().style.opacity = "1"

	});

	// Commented out since popups now display on click 
	// map.on('mouseleave', 'network-points-layer', () => {
	// 	map.getCanvas().style.cursor = '';
	// 	popup.remove();
	// });
};
