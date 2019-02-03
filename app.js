'use strict';

const DEBUG = process.env.DEBUG === '1';
if (DEBUG) {
    require('inspector').open(9229, '0.0.0.0', false);
}

const Homey = require('homey');

class MyApp extends Homey.App {
	
	onInit() {
        this.log('Novy InTouch app is running...');
	}
	
}

module.exports = MyApp;
