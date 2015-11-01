var app = require('app'),  // Module to control application life.
    server,
    BrowserWindow = require('browser-window'),  // Module to create native browser window.
    Menu = require('menu'),
    Tray = require('tray'),
    nconf = require('nconf'),
    _ = require('lodash'),
    nconfParams = new nconf.Provider().file('config', __dirname + '/appParams.json');

// Report crashes to our server.
require('crash-reporter').start();

// for squirrel install
if(require('electron-squirrel-startup')) return;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null,
    trayIcon = null,
    appParams = {},
    windowMenu,
    trayMenu,
    exiting = false,
    appIcon = __dirname + '/public/img/subnode-icon.png';

function exitApp() {
    exiting = true;
    server.stop();
    app.quit();
}

var menuTemplate = [{
    label: 'Keep server running when window closed',
    type: 'checkbox',
    id: "closeToTray",
    click: function() {
        nconfParams.set("closeToTray", !appParams.closeToTray);
        nconfParams.save(function(err) {
            if(err) {
                console.log(err);
            }
            appParams.closeToTray = !appParams.closeToTray;
            _.find(trayMenu.items, {id: "closeToTray"}).checked = appParams.closeToTray;
            _.find(windowMenu.items[0].submenu.items, {id: "closeToTray"}).checked = appParams.closeToTray;
        });
    }
}, {
    label: 'Hide window',
    click: function() {
        mainWindow.hide();
    }
}, {
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: exitApp
}];

function setWindowMenu() {
    windowMenu = Menu.buildFromTemplate([{
        label: 'Menu',
        submenu: [{
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: function() {
                BrowserWindow.getFocusedWindow().reloadIgnoringCache();
            }
        }, {
            label: 'Toggle DevTools',
            accelerator: 'Alt+CmdOrCtrl+I',
            click: function() {
                BrowserWindow.getFocusedWindow().toggleDevTools();
            }
        }].concat(menuTemplate)
    }]);

    Menu.setApplicationMenu(windowMenu);
};

function setTrayMenu() {
    trayIcon = new Tray(appIcon);
    trayMenu = Menu.buildFromTemplate(menuTemplate);
    trayIcon.setToolTip('Subnode');
    trayIcon.setContextMenu(trayMenu);
    trayIcon.on('clicked', function() {
        mainWindow.show();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Start the server
    server = require(__dirname + '/app.js');

    // Create the browser window.
    mainWindow = new BrowserWindow({
        icon: appIcon,
        resizable: true
    });

    mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadUrl('http://localhost:3000/');

    // Open the DevTools.
    //mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.on('close', function(e) {
        if(appParams.closeToTray && !exiting) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    nconfParams.load(function() {
        appParams = {
            closeToTray: nconfParams.get('closeToTray')
        };

        menuTemplate[0].checked = appParams.closeToTray;

        setWindowMenu();
        setTrayMenu();
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', exitApp);

app.on('login', function(event, webContents, request, authInfo, callback) {
    event.preventDefault();

    // auto login
    var appParams = require(__dirname + '/appParams.json');
    callback(appParams.username, appParams.password);
});
