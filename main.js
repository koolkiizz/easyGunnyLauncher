// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, autoUpdater} = require('electron')
const path = require('path')
const EventEmitter = require('events')
const http = require('http')
const fs = require('fs')
const config = require('./const')
const {ipcMain} = require('electron')

//region enable flash
let pluginName = null; //put the right flash plugin in depending on the operating system.
switch (process.platform) {
  case 'win32':
      pluginName = 'pepflashplayer.dll';
    break
  case 'linux':
      pluginName = 'libpepflashplayer.so';
      app.commandLine.appendSwitch('no-sandbox');
    break;
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break;
}
app.commandLine.appendSwitch("disable-renderer-backgrounding");
if (process.platform !== "darwin") {
  app.commandLine.appendSwitch('high-dpi-support', "1");
  //app.commandLine.appendSwitch('force-device-scale-factor', "1");
}
app.commandLine.appendSwitch("--enable-npapi");
// app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, 'flashver/' + pluginName));
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname.includes(".asar") ? process.resourcesPath : __dirname, "flashver/" + pluginName));
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
// app.commandLine.appendSwitch('incognito');
//endregion

//region updater
  const url = `${server}/update/${process.platform}/${app.getVersion()}`
  autoUpdater.setFeedURL({ url })
//endregion

var chargeWindow = null;
var exchangeWindow = null;
var changePasswordWindow = null;
//region declare event for windows
  //region close event
  ipcMain.on('close-me', (evt, arg) => {
    var allWindows = BrowserWindow.getAllWindows();
    var window = allWindows[evt.sender.currentIndex];
    if (window !== null) {
      var clicked = dialog.showMessageBoxSync(window,{
        buttons: ['Thoát ngay', 'Không thoát'],
        title: 'Cảnh báo',
        message: 'Bạn có chắc chắn muốn thoát game?'
      });
      if (clicked !== 0) {
        return;
      }
    }
    app.quit();
  });
  //endregion
  //region minimize event
  ipcMain.on('minimize-me', (evt, arg) => {
    var allWindows = BrowserWindow.getAllWindows();
    var window = allWindows[evt.sender.currentIndex];
    if (window !== null) {
      evt.preventDefault();
      window.minimize();
    }
  });
  //endregion
  //region IgnoreMouseEvent
  ipcMain.on('IgnoreMouseEvent', (evt, args) => {
    var allWindows = BrowserWindow.getAllWindows();
    var window = allWindows[evt.sender.currentIndex];
    if (window !== null) {
      window.setIgnoreMouseEvents(true, {forward: true});
    }
  });
  //endregion
  //region DontIgnoreMouseEvent
  ipcMain.on('DontIgnoreMouseEvent', (evt, args) => {
    var allWindows = BrowserWindow.getAllWindows();
    var window = allWindows[evt.sender.currentIndex];
    if (window !== null) {
      window.setIgnoreMouseEvents(false, {forward: false});
    }
  });
  //endregion
  //region messagebox event
  ipcMain.on('messagebox', (evt, args) => {
    var allWindows = BrowserWindow.getAllWindows();
    var window = allWindows[evt.sender.currentIndex];
    if (window !== null) {
      dialog.showMessageBoxSync(window, {
        buttons: ['Đồng ý'],
        title: args[0],
        message: args[1]
      });
    } else {
      dialog.showMessageBoxSync({
        buttons: ['Đồng ý'],
        title: args[0],
        message: args[1]
      });
    }
  });
  //endregion
  //region switchToPlay event
  ipcMain.on('switchToPlay', (evt, args) => {
    var allWindows = BrowserWindow.getAllWindows();
    var window = allWindows[evt.sender.currentIndex];
    if (window !== null) {
      var playWindow = createPlayWindow();
      window.close();
    }
  });
  //endregion
  //region resize-me event
  ipcMain.on('resize-me', (evt, arg) => {
    var allWindows = BrowserWindow.getAllWindows();
    var window = allWindows[evt.sender.currentIndex];
    if (window !== null) {
      if (arg.length >= 4) {
        window.setMinimumSize(arg[2], arg[3]);
      }
      window.setSize(arg[0], arg[1], true);
    }
  });
  //endregion
  //region charge-open event
  ipcMain.on('charge-open', (evt, arg) => {
    if (chargeWindow !== null && !chargeWindow.isDestroyed()) {
      chargeWindow.show();
      return;
    }
    chargeWindow = createChargeWindow();
  });
  //endregion
  //region exchange-open event
  ipcMain.on('exchange-open', (evt, arg) => {
    if (exchangeWindow !== null && !exchangeWindow.isDestroyed()) {
      exchangeWindow.show();
      return;
    }
    exchangeWindow = createExchangeWindow();
  });
  //endregion
  //region exchange-open event
  ipcMain.on('change-password-open', (evt, arg) => {
    if (changePasswordWindow !== null && !changePasswordWindow.isDestroyed()) {
      changePasswordWindow.show();
      return;
    }
    changePasswordWindow = createChangePasswordWindow();
  });
  //endregion
//endregion

//region declare windows
var _loadingWindow;
const loadingEvents = new EventEmitter()
var serverList = []
function createMainWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/preload.js')
    }
  });
  mainWindow.loadFile('windows/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function createLoginWindow () {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 1085,
    height: 686,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/login.js')
    }
  });
  window.loadFile('windows/login.html')

  // Open the DevTools.
  // window.webContents.openDevTools()
}

function loadingWindow() {
  const window = new BrowserWindow({
    width: 840,
    height: 270,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/loading.js')
    }
  });
  window.loadFile('windows/loading.html')
  // window.webContents.openDevTools()
  return window;
}

function createPlayWindow () {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 1002,
    height: 676,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/play.js'),
      nodeIntegration: true,
      webviewTag: true,
      plugins: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  window.loadFile('windows/play.html')

  // Open the DevTools.
  // window.webContents.openDevTools()
  return window;
}

function createChargeWindow () {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 1200,
    height: 726,
    autoHideMenuBar: true,
    transparent: false,
    frame: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/charge.js'),
    }
  });
  window.loadFile('windows/charge.html')

  // Open the DevTools.
  // window.webContents.openDevTools()
  return window;
}

function createExchangeWindow () {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 800,
    height: 526,
    autoHideMenuBar: true,
    transparent: false,
    frame: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/exchange.js'),
    }
  });
  window.loadFile('windows/exchange.html')

  // Open the DevTools.
  // window.webContents.openDevTools()
  return window;
}

function createChangePasswordWindow () {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 450,
    height: 406,
    autoHideMenuBar: true,
    transparent: false,
    frame: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/changePassword.js'),
    }
  });
  window.loadFile('windows/changePassword.html')

  // Open the DevTools.
  // window.webContents.openDevTools()
  return window;
}
//endregion

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createLoginWindow();
  // createPlayWindow();
  /*
  _loadingWindow = loadingWindow();
  _loadingWindow.webContents.once('dom-ready', () => {
    setTimeout(() => {
      let rawData = '';
      http.get(config.host + '/api/serverlist', function(response) {
        response.on('data', (c) => {
          rawData += c;
        });
        response.on('end', () => {
          try {
            var serverlist = JSON.parse(rawData);
            serverList = serverlist.data
            _loadingWindow.close()
            createLoginWindow()
          } catch (e) {
            var clicked = dialog.showMessageBoxSync(_loadingWindow,{
              buttons: ['Đồng ý'],
              title: 'Cảnh báo',
              message: 'Không thể kết nối máy chủ, vui lòng liên hệ quản trị viên để được hỗ trợ!'
            });
            if (clicked === 0) {
              _loadingWindow.hide();
              app.exit(0);
            }
          }
        });
      }).on('error', function(err) {
        var clicked = dialog.showMessageBoxSync({
          buttons: ['Đồng ý'],
          title: 'Cảnh báo',
          message: 'Không thể kết nối máy chủ, vui lòng liên hệ quản trị viên để được hỗ trợ!'
        });
        if (clicked === 0) {
          _loadingWindow.hide();
          app.exit(0);
        }
      });
    }, 3000);
  });
   */

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
