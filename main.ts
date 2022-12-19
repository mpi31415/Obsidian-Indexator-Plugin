import { App, Plugin, PluginSettingTab,Vault} from 'obsidian';

// Remember to rename these classes and interfaces!

interface IndexatorSettings {
	path: string
}

const DEFAULT_SETTINGS: IndexatorSettings = {
	path: "Index"
	
}

export default class MyPlugin extends Plugin {
	settings: IndexatorSettings;
	myVault: Vault;
	async onload() {
		await this.loadSettings();
		this.myVault = app.vault;

		this.addSettingTab(new IndexatorSettingTab(this.app, this))

		//locate indexator.md file -> if not exists create one 


		}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
class IndexatorSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
	}
}
