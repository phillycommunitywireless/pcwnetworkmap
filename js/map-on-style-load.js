// import loadBroadbandAccessLayer from './layers/broadband-access-layer.js';
// import loadIncomeLayer from './layers/income-layer.js';
import loadHeatmap from './layers/load-heatmap.js';
import loadNeighborhoodsLayer from './layers/neighborhoods-layer.js';
import { loadNetworkLayers, loadNetworkPoints } from './layers/network-layers.js';
import load3dBuildings from './layers/three-d-buildings.layer.js';

export default () => {
	map.on('style.load', async () => {
		// load required data
		const network_points_data = await loadNetworkPoints();
		load3dBuildings();

		const loadingMessage = document.querySelector('#loading');
		if (loadingMessage) {
			loadingMessage.style.display = 'none';
		}

		// load async layers
		loadNetworkLayers();
		loadNeighborhoodsLayer();
		// loadIncomeLayer();
		// loadBroadbandAccessLayer();
		// end async layers

		// Create heatmap based on features' "type" property
		if (network_points_data) {
			loadHeatmap(network_points_data);
		}
	});
};
