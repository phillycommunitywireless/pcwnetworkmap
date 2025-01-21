import popupHandler from '../util/popup-handler.js';
import {
	createRangeColorExpression,
	fetchJSON,
	generateCentroids,
	generateLabelFromNeighborhood,
} from '../util/util.js';

const FeatureIdKey = 'spatial_id';
const LayerSource = 'no-broadband-source';
const LayerId = 'no-broadband-layer';

/** NB "no_broad" refers to the percent of households, per block, without access */
export default async () => {
	const data_url = 'data/no-broadband-percent.geojson';
	const data = await fetchJSON(data_url);

	const centroids = generateCentroids(data, FeatureIdKey, 'name');
	const colorExpression = createRangeColorExpression(data, 'no_broad', {
		invert: true,
	});
	map.addSource(LayerSource, {
		type: 'geojson',
		data,
	});

	map.addLayer({
		id: LayerId,
		type: 'fill',
		source: LayerSource,
		layout: {
			visibility: 'none',
		},
		paint: {
			'fill-color': colorExpression,
			'fill-opacity': 0.25,
		},
		filter: ['==', '$type', 'Polygon'],
	});

	const popupHtml = (feature, e) => {
		const val = feature.properties.no_broad;
		const useVal = val ? val + '%' : 'Unknown';
		const useLabel = generateLabelFromNeighborhood(feature, e);
		return `<strong>Area:</strong> ${useLabel}<br>
						<strong>Households w/o Internet:</strong> ${useVal}`;
	};

	popupHandler({
		centroids,
		onCloseEventLabel: 'close-broadband-popup',
		popupCheckboxId: 'show-broadband-popup',
		popupHtml,
		targetFeatureIdKey: FeatureIdKey,
		targetLayerLabel: LayerId,
	});
};
