const electron = require('electron');
const {app, BrowserWindow} = electron;

app.on('ready',() => {
	let mainWindow = new BrowserWindow({width:800,height:600});
	mainWindow.loadURL('https://google.com');
});