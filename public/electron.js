const { autoUpdater } = require("electron-updater")

// 引入electron并创建一个Browserwindow
const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow
const log = require("electron-log")
log.transports.file.level = "info"
log.transports.console.level = true; 
function createWindow() {
    //创建浏览器窗口,宽高自定义具体大小你开心就好
    mainWindow = new BrowserWindow({ width: 1440, height: 900, minHeight: 900, minWidth: 1440 })
    let baseUrl;
    mainWindow.webContents.openDevTools();
    baseUrl = url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    });

    mainWindow.loadURL(baseUrl)

    // 关闭window时触发下列事件.
    mainWindow.on('closed', function () {
        mainWindow = null
    })

    mainWindow.setMenuBarVisibility(false)

    autoUpdater.logger = log
    log.error("test", autoUpdater.getFeedURL())
    autoUpdater.setFeedURL(`http://obs.ljy.im/${process.platform === 'darwin' ? 'mac' : 'win'}/`)
    sendUpdateMessage('platform', process.platform === 'darwin' ? 'mac' : 'win');
    // 下面是自动更新的整个生命周期所发生的事件
    autoUpdater.on('error', function (...args) {
        sendUpdateMessage('error', args);
    });
    autoUpdater.on('checking-for-update', function (message) {
        sendUpdateMessage('checking-for-update', message);
    });
    autoUpdater.on('update-available', function (message) {
        sendUpdateMessage('update-available', message);
    });
    autoUpdater.on('update-not-available', function (message) {
        sendUpdateMessage('update-not-available', message);
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        sendUpdateMessage('downloadProgress', progressObj);
    });
    // 更新下载完成事件
    autoUpdater.on('update-downloaded', function (...args) {
        sendUpdateMessage('isUpdateNow', args);
        autoUpdater.quitAndInstall();
    });

    //执行自动更新检查
    autoUpdater.checkForUpdates();
}

// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message, data) {
    log.info({ message, data });
    try{
        mainWindow.webContents.executeJavaScript(`console.log(${JSON.stringify(data)}, ${JSON.stringify(message)});`);
    }catch(e){

    }
}


// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', createWindow)

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
    // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
    if (mainWindow === null) {
        createWindow()
    }
})


// 你可以在这个脚本中续写或者使用require引入独立的js文件.
