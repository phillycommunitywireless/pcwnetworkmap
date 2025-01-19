/**
 * Manages popups, bound to layer / feature centroids.
 *
 * **Requires** centroid data from target layer.
 *
 * **Requires** neighborhood layer
 *
 * e.g.
 * ```
 * const centroids = generateCentroids(...);
 * ```
 *
 * @param {Object} params
 * @param {Object} params.centroids - Centroid data to anchor popups
 * @param {string} params.onCloseEventLabel - label to bind the popup closing
 * @param {string} params.targetFeatureIdKey - the layer the centroids were generated from
 * @param {string} params.targetLayerLabel - the layer the centroids were generated from
 * @param {(feature:FeatureData, e: MapEvent) => string} params.popupHtml - a fn which returns the HTML displayed in the popup
 * @param {string} [params.popupCheckboxId] - the HTML Id for the checkbox associated with toggling popup visibility
 */
export default ({
	centroids,
	onCloseEventLabel,
	targetFeatureIdKey,
	targetLayerLabel,
	popupHtml,
	popupCheckboxId,
}) => {
	let currentPopup = null;
	let currentFeatureId = null;
	const cleanupPopup = () => {
		currentPopup?.remove();
		currentPopup = null;
		currentFeatureId = null;
	};

	map.on(onCloseEventLabel, cleanupPopup);

	const centroidDict = centroids.reduce((acc, c) => {
		acc[c.properties.id] = c;
		return acc;
	}, {});

	const handlePopup = (e) => {
		const [feature] = map.queryRenderedFeatures(e.point, {
			layers: [targetLayerLabel],
		});

		if (feature) {
			const featureId = feature.properties[targetFeatureIdKey];

			if (
				popupCheckboxId &&
				!document.getElementById(popupCheckboxId).checked
			) {
				return;
			}

			if (currentFeatureId !== featureId) {
				const featureCentroid = centroidDict[featureId];
				if (!currentPopup) {
					currentPopup = new mapboxgl.Popup({
						anchor: 'bottom',
						closeOnClick: false,
					});
					currentPopup.on('close', () => {
						currentPopup = null;
					});

					currentPopup.addTo(map);
				}

				currentPopup
					.setLngLat(featureCentroid?.geometry.coordinates || e.lngLat)
					.setHTML(popupHtml(feature, e));

				currentFeatureId = featureId;
			}
		} else if (!feature && currentFeatureId && currentPopup) {
			cleanupPopup();
		}

		map.getCanvas().style.cursor = feature ? 'pointer' : '';
	};

	map.on('mousemove', targetLayerLabel, handlePopup);
	map.on('touchstart', targetLayerLabel, handlePopup);
	map.on('mouseleave', targetLayerLabel, (e) => {
		// close any open popup on leaving the parent layer
		const features = map.queryRenderedFeatures(e.point, {
			layers: [targetLayerLabel],
		});
		if (!features.length) {
			map.fire(onCloseEventLabel);
		}
	});
};
