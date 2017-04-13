const { app, ipcMain, Tray, Menu, BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')

const nopeIcon = path.join(__dirname, 'icon-nope.png')
const yepIcon = path.join(__dirname, 'icon-nope.png')
let window = null
let tray = null

const createTray = () => {
  tray = new Tray(nopeIcon)
  tray.setToolTip('mastodon.social')
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
}

const createServer = () => {
  server = http.createServer((req, res) => {
    window.loadURL(`https://${req.url.slice(1)}`)
    window.setSize(500, 800, true)
    window.setResizable(true)
    res.end('done', () => server.close())
  })
  server.listen(8291)
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 500,
    height: 60,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

app.on('ready', () => {
  createTray()
  createWindow()
  createServer()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})
