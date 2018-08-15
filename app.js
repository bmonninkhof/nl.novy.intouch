'use strict';

//require('inspector').open(9229, '0.0.0.0', true);

const Homey = require('homey');

class MyApp extends Homey.App {
	
	onInit() {
        this.log('MyApp is running...');

        //Homey.ManagerSpeechOutput.say('Hello world!')
        //    .then(this.log)
        //    .catch(this.error);
	}
	
}

module.exports = MyApp;
