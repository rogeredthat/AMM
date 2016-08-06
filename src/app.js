/*jshint esversion: 6 */

const electron = require('electron');
const {
  app,
  BrowserWindow
} = electron;

app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });
  mainWindow.loadURL('file://' + __dirname + '/ui/index.html');

  var expressserver = require('./server/main');

  expressserver.set('port', process.env.PORT || 3000);

  var server = expressserver.listen(expressserver.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
    let fuckingWindow = new BrowserWindow({
      width: 400,
      height: 60
    });
    fuckingWindow.loadURL('http://localhost:3000');
  });
  app.on('window-all-closed', () => {});

});
