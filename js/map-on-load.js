import { toggleSidebar } from '/js/bind-elements.js';
import initHeatmap from '/js/init-heatmap.js';
import { loadNetworkLayers, loadNetworkPoints } from '/js/network-layers.js';

export default () => {
	map.on('load', async () => {
		// load the basic nodes for display
		const network_points_data = await loadNetworkPoints();

		const loadingMessage = document.querySelector('#loading');
		if (loadingMessage) {
			loadingMessage.style.display = 'none';
		}

		loadNetworkLayers();

		// Create heatmap based on features' "type" property
		initHeatmap(network_points_data);
		toggleSidebar();
	});
};
