import { toggleSidebar } from './bind-elements.js';

export default () => {
	map.on('load', async () => {
		if (document.body.clientWidth > 500) {
			toggleSidebar();
		}
	});
};
