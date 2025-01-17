import { toggleSidebar } from '/js/bind-elements.js';
import initHeatmap from '/js/init-heatmap.js';
import loadIncomeLayer from '/js/layers/income-layer.js';
import loadNeighborhoodsLayer from '/js/layers/neighborhoods-layer.js';
import { loadNetworkLayers, loadNetworkPoints } from '/js/layers/network-layers.js';

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
		// end async layers

		// Create heatmap based on features' "type" property
		initHeatmap(network_points_data);
		toggleSidebar();
	});
};
