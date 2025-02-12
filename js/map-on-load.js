import { toggleSidebar } from './bind-elements.js';
import testMobile from './util/test-mobile.util.js';

export default () => {
	map.on('load', async () => {
		const isMobile = testMobile();
		if (isMobile.phone) {
			toggleSidebar();
		}
	});
};
