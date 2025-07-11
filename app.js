'use strict';

// Note: Homey SDK v3 provides global Homey object in runtime environment

class NovyIntouchApp extends Homey.App {
	
	/**
	 * onInit is called when the app is initialized.
	 */
	async onInit() {
		this.log('Novy InTouch app has been initialized');
		
		// Register flow cards
		this._registerFlowCards();
	}
	
	/**
	 * Register flow cards
	 */
	_registerFlowCards() {
		// Register trigger flow cards
		this.homey.flow.getTriggerCard('novy-hood:received')
			.registerRunListener(async (args, state) => {
				return args.command === state.command;
			});
			
		// Register action flow cards  
		this.homey.flow.getActionCard('novy-hood:send')
			.registerRunListener(async (args, state) => {
				return args.device.sendCommand(args.command);
			});
	}
}
module.exports = NovyIntouchApp;
