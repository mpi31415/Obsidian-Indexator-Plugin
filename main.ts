import { App, Editor, MarkdownView, MarkdownEditView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Vault, View, Workspace, WorkspaceLeaf, TextFileView, TFolder } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	myVault: Vault;
	async onload() {
		await this.loadSettings();
		this.myVault = app.vault;

	
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Indexator', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a now tice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bat Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
			//	console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			//console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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
class myVault extends Vault{
	constructor(){
		super();
	}
}
class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

function findIndexatorFile(searchPath: String){
	let allFiles = this.app.vault.getFiles();
						//console.log(allFiles.length);
						for (let i = 0; i<allFiles.length; i++){
							
							if(allFiles[i].path==searchPath){
								return allFiles[i];
				
								break;
							}
						}
}

function closeOpenIndexatorLeaves(){
	this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf)=>{
		//console.log(leaf.getViewState().type);
		if(leaf.getViewState().type == "markdown"){
			//console.log(leaf.getDisplayText());
			if(leaf.getDisplayText()=="Indexator"){
				leaf.detach();
			}
		}
	})
}
function findAllTopLevelFolders(folder:TFolder){
	let folders: string[] = [];
	for(let i = 0; i<folder.children.length;i++){

		if(folder.children[i] instanceof TFolder){
			folders.push(folder.children[i].name);
			console.log(folder.children[i].name);
			
		}
	}
	return folders;
}

function findAllFolders(){
	let allFolders: string[] = [];
	let root = this.app.vault.getRoot();
	let allTPF = findAllTopLevelFolders(root);
	for(let f of allTPF){
		allFolders.push(f);

	}

	return allFolders;
}
function initializeIndexatorFile(file:TFile, baseName: string){
	this.app.vault.modify(file,"");
	//writes
	this.app.vault.append(file,"Untick all folders which you want to be indexed \n ______ \nimportant Note: \nfor a file to be indexed, it requires at least one tag(files with multiple tags, will be indexed multiple times), else the file will be found under \"unindexed\" \n_____\n").then(()=>{});	
	//adds folders

	let allF = findAllFolders();
	for(let fol of allF){
		if(fol!=baseName){
			this.app.vault.append(file, "- [X] "+fol+"\n");
		}
	
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Indexator.'});

	

		new Setting(containerEl)
			.setName('Set your indexation-file')
			.setDesc('Create or choose a new file')
			.addText(text => text
				.setPlaceholder('A new folder, with this name will be created')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					//alert('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}))
				.addButton(bt => bt
					.setButtonText('Save').onClick(async ()=>{

					this.app.vault.createFolder(this.plugin.settings.mySetting).catch(()=>{
						alert("Such a folder already exists: "+this.plugin.settings.mySetting);
					});

					let exists = false;
					let indexPath = this.app.vault.getRoot().path+"/"+this.plugin.settings.mySetting+"/"+"Indexator.md";
					let searchPath = this.plugin.settings.mySetting+"/"+"Indexator.md";
					
					let file = await this.app.vault.create(indexPath,"").catch(()=>{
						exists = true;
						alert("Such a file aready exsists");
					}).then();

					if(exists){
						file = findIndexatorFile(searchPath);
					}
				
					closeOpenIndexatorLeaves();

					if (file instanceof TFile){
					
						let leaf = this.app.workspace.getLeaf(true);
						leaf.openFile(file);
						//creates file for the first time
						if(!exists){
						 initializeIndexatorFile(file, this.plugin.settings.mySetting);
						}
						


					}
				}
					 
		));
	}
}
