const electron = require('electron');
const {app, BrowserWindow} = electron;

app.on('ready',() => {
	let mainWindow = new BrowserWindow({icon:'ui/img/favicon.png',autoHideMenuBar:true});
	mainWindow.maximize();
	mainWindow.loadURL('file://' + __dirname + '/ui/index.html');
});
app.on('window-all-closed',() => {
});