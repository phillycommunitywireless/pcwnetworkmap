import loadHeatmap from './layers/load-heatmap.js';
import { loadNetworkLayers, loadNetworkPoints } from './layers/network-layers.js';
import load3dBuildings from './layers/three-d-buildings.layer.js';
import { setNetworkPointsData } from './bind-points-visibility.js';

export default () => {
	map.on('style.load', async () => {
		try {
			// load required data
			const network_points_data = await loadNetworkPoints();

			// 3D buildings are decorative; a failure here must not stall the
			// rest of the load sequence below.
			try {
				load3dBuildings();
			} catch (e) {
				console.error(e);
			}

			// load async layers
			loadNetworkLayers();
			// end async layers

			// Create heatmap based on features' "type" property
			if (network_points_data) {
				setNetworkPointsData(network_points_data);
				loadHeatmap(network_points_data);
			}

			// Signal that all synchronous layers are ready so bind-elements.js
			// can enforce tab-based visibility before the first render.
			map.fire('layers-ready');
		} finally {
			// Always clear the overlay, even if a step above threw, so the page
			// is never stuck on "Loading...".
			const loadingMessage = document.querySelector('#loading');
			if (loadingMessage) {
				loadingMessage.style.display = 'none';
			}
		}
	});
};
