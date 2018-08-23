'use strict';

require('inspector').open(9229, '0.0.0.0', true);

const Homey = require('homey');

class MyApp extends Homey.App {
	
	onInit() {
        this.log('Novy InTouch app is running...');
	}
	
}

module.exports = MyApp;
