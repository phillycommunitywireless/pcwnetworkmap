import load3dBuildings from './layers/three-d-buildings.layer.js';
export default () => {
	map.on('style.load', async () => {
		load3dBuildings();
	});
};
