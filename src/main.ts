import { app, BrowserView, BrowserWindow, ipcMain, shell } from 'electron';
import { BelaviaHandler } from './belavia-main';
import { sleep } from './utils';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const CONTROLS_WEBPACK_ENTRY: string;
declare const CONTROLS_PRELOAD_WEBPACK_ENTRY: string;

const directions = [
  { from: 'MSQ', to: 'TBS' },
  { from: 'MSQ', to: 'KUT' },
  { from: 'MSQ', to: 'BUS' }
];

let directionIndex = 0;

const dateMin = new Date();
const dateMax = new Date(2022, 10 - 1, 1);

const currentDate = new Date(dateMin.getTime());

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = async (): Promise<void> => {

  const windowWidth = 1200;
  const windowHeight = 1200;
  const windowGap = 26;
  const controlsWidth = 200;

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: 800,
    backgroundColor: '#444'
  });

  console.log(`CONTROLS_WEBPACK_ENTRY: ${CONTROLS_WEBPACK_ENTRY}`)
  console.log(`CONTROLS_PRELOAD_WEBPACK_ENTRY: ${CONTROLS_PRELOAD_WEBPACK_ENTRY}`)

  const controlsView = new BrowserView({
    webPreferences: {
      preload: CONTROLS_PRELOAD_WEBPACK_ENTRY
    }
  });

  mainWindow.addBrowserView(controlsView);

  controlsView.setBounds({ x: 0, y: windowGap, width: controlsWidth, height: windowHeight - windowGap })
  controlsView.setAutoResize({ width: true, height: true });

  // controlsView.webContents.openDevTools({ mode: 'detach' });
  controlsView.webContents.loadURL(CONTROLS_WEBPACK_ENTRY);

  const belaviaHandler = new BelaviaHandler();

  mainWindow.addBrowserView(belaviaHandler.view)

  belaviaHandler.view.setBounds({ x: controlsWidth, y: windowGap, width: windowWidth - controlsWidth, height: windowHeight - windowGap })
  belaviaHandler.view.setAutoResize({ width: true, height: true });
  // belaviaHandler.view.webContents.openDevTools();

  // убирает синхронизацию заголовка с <title> страницы html
  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  const findTickets = (airportFrom: string, airportTo: string, date: Date): void => {
    // console.log(date.toLocaleDateString());
    belaviaHandler.findTickets(airportFrom, airportTo, date);
    mainWindow.setTitle(`${airportFrom} --> ${airportTo}  | ${date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  }

  ipcMain.removeHandler('on-tickets');

  ipcMain.handle('on-tickets', async (event, ticketCount: number) => {
    console.log(`Found tickets ${ticketCount}`);

    if (ticketCount > 0) {
      console.log(`SUCCESS`);
      shell.openExternal(belaviaHandler.lastUrl)
      return;
    }

    if (directionIndex < directions.length - 1) {
      directionIndex++;

      const direction = directions[directionIndex];

      await sleep(Math.round(5000 * Math.random() + 1000));
      findTickets(direction.from, direction.to, currentDate);

      return;
    }

    // дошли до конца дат
    if (directionIndex === directions.length - 1) {

      directionIndex = 0;
    } else {
      directionIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);

    const dayAfterMax = new Date(dateMax.getTime());
    dayAfterMax.setDate(dayAfterMax.getDate() + 1);

    if (currentDate > dayAfterMax) {
      console.log('start searching from the beginning');

      directionIndex = 0;
      currentDate.setTime(dateMin.getTime());
    }

    const direction = directions[directionIndex];
    await sleep(Math.round(5000 * Math.random()) + 1000);
    findTickets(direction.from, direction.to, currentDate);
  });

  const direction = directions[directionIndex];
  findTickets(direction.from, direction.to, currentDate);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
