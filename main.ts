import { App, Plugin, PluginSettingTab,Setting,TFile,TFolder,Events,Vault} from 'obsidian';




interface IndexatorSettings {
	path: string,
	fileName: string
}

const DEFAULT_SETTINGS: IndexatorSettings = {
	path: "Index",	
	fileName:"Indexator"
}

let CURRENT_SETTINGS: IndexatorSettings = DEFAULT_SETTINGS;

export default class MyPlugin extends Plugin {
	settings: IndexatorSettings;
	myVault: Vault;
	async onload() {
		await this.loadSettings();
		this.myVault = app.vault;
		let root = this.app.vault.getRoot();
		

		this.addSettingTab(new IndexatorSettingTab(this.app, this))

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



function getAllFolders(folder: TFolder){
	let allFolders: TFolder[] = new Array<TFolder>;
	folder.children.forEach((file)=>{
		if(file instanceof TFolder){
			allFolders.push(file);
		}
	 });
	 return allFolders;
}


function index(folderStates: Map<TFolder,boolean>){
	folderStates.forEach((state, fol)=>{
		if(state)
			app.vault.create(fol.path+"/Index.md","");
	});
}
class IndexatorSettingTab extends PluginSettingTab {
	
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		let allFolders = getAllFolders(this.app.vault.getRoot());
		let foldersStates: Map<TFolder, boolean> = new Map<TFolder,boolean>;
		for (let fol of allFolders){
			foldersStates.set(fol, true);
		}
		
		containerEl.empty();
		
		containerEl.createEl("h2",{text:"Folders to be indexed, untick all those which are not supposed to be indexed"});
		for(let a of allFolders){
			new Setting(containerEl)
				.setName(a.name)
				.setClass("checked")
				.addToggle((cb)=>{
					cb.setValue(true);
					cb.onChange((val)=>{
						foldersStates.set(a, val);
					})
			});	
		}
		
		new Setting(containerEl).addButton((bt)=>{
			bt.setButtonText("Index");
			bt.onClick(()=>{
				index(foldersStates);
			});
		});		
	
		containerEl.show();

	
	}
}
