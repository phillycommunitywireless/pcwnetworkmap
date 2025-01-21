import { toggleSidebar } from './bind-elements.js';
import initHeatmap from './init-heatmap.js';
import loadBroadbandAccessLayer from './layers/broadband-access-layer.js';
import loadIncomeLayer from './layers/income-layer.js';
import loadNeighborhoodsLayer from './layers/neighborhoods-layer.js';
import { loadNetworkLayers, loadNetworkPoints } from './layers/network-layers.js';

export default () => {
	map.on('load', async () => {
		// load the basic nodes for display
		const network_points_data = await loadNetworkPoints();

		const loadingMessage = document.querySelector('#loading');
		if (loadingMessage) {
			loadingMessage.style.display = 'none';
		}

		// load async layers
		loadNetworkLayers();
		loadNeighborhoodsLayer();
		loadIncomeLayer();
		loadBroadbandAccessLayer();
		// end async layers

		// Create heatmap based on features' "type" property
		initHeatmap(network_points_data);

		if (document.body.clientWidth > 500) {
			toggleSidebar();
		}
	});
};
