import { app, BrowserView, BrowserWindow, ipcMain, shell } from 'electron';
import { BelaviaHandler } from './belavia-main';
import { getStoredSettings, sleep, storeSettings } from './node-utils';
import { ITicketSearchParameters } from './ITicketSearchParameters';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const CONTROLS_WEBPACK_ENTRY: string;
declare const CONTROLS_PRELOAD_WEBPACK_ENTRY: string;

let ticketSearchParameters: ITicketSearchParameters | undefined;
let directionIndex = 0;
const currentDate = new Date();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

// глобальные хендлеры

ipcMain.handle('get-settings', async (): Promise<ITicketSearchParameters> => {
  const settings = await getStoredSettings();
  return settings;
});

const createWindow = async (): Promise<void> => {
  const windowWidth = 1200;
  const windowHeight = 700;
  const windowGap = 26;
  const controlsWidth = 200;

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
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

  controlsView.webContents.openDevTools({ mode: 'detach' });
  controlsView.webContents.loadURL(CONTROLS_WEBPACK_ENTRY);

  const belaviaHandler = new BelaviaHandler();

  mainWindow.addBrowserView(belaviaHandler.view)

  belaviaHandler.view.setBounds({ x: controlsWidth, y: windowGap, width: windowWidth - controlsWidth, height: windowHeight - windowGap })
  belaviaHandler.view.setAutoResize({ width: true, height: true });
  belaviaHandler.view.webContents.openDevTools();

  // убирает синхронизацию заголовка с <title> страницы html
  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  const findTickets = (airportFrom: string, airportTo: string, date: Date): void => {
    if (ticketSearchParameters === undefined)
      return;

    // console.log(date.toLocaleDateString());
    belaviaHandler.findTickets(airportFrom, airportTo, date);
    mainWindow.setTitle(`${airportFrom} --> ${airportTo}  | ${date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  }

  ipcMain.removeHandler('on-tickets');
  ipcMain.removeHandler('search-tickets');
  ipcMain.removeHandler('search-tickets-stop');

  ipcMain.handle('search-tickets', async (_event, sp: ITicketSearchParameters) => {
    console.log(sp);
    ticketSearchParameters = sp;

    currentDate.setTime(sp.dateFrom.getTime());

    const direction = ticketSearchParameters.directions[directionIndex];

    findTickets(direction.from, direction.to, currentDate);

    await storeSettings(ticketSearchParameters);
  });

  ipcMain.handle('search-tickets-stop', () => {
    ticketSearchParameters = undefined;
    directionIndex = 0;
    currentDate.setTime(0);

    // очищаем страницу
    belaviaHandler.view.webContents.loadURL("data:text/html;base64," + "PCFET0NUWVBFIGh0bWw-CjxodG1sIGxhbmc9ImVuIj4KCjxoZWFkPgogIDxtZXRhIG5hbWU9ImRlc2NyaXB0aW9uIiBjb250ZW50PSJXZWJwYWdlIGRlc2NyaXB0aW9uIGdvZXMgaGVyZSIgLz4KICA8bWV0YSBjaGFyc2V0PSJ1dGYtOCI-CiAgPHRpdGxlPkNoYW5nZV9tZTwvdGl0bGU-CiAgPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xIj4KICA8bWV0YSBuYW1lPSJhdXRob3IiIGNvbnRlbnQ9IiI-CiAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJjc3Mvc3R5bGUuY3NzIj4KICA8c2NyaXB0IHNyYz0iaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnktbGF0ZXN0Lm1pbi5qcyI-PC9zY3JpcHQ-CjwvaGVhZD4KCjxib2R5PgogIAo8ZGl2IGNsYXNzPSJjb250YWluZXIiPgogIAo8L2Rpdj4KCjxzY3JpcHQ-Cjwvc2NyaXB0PgoKPC9ib2R5Pgo8L2h0bWw-");
  });

  ipcMain.handle('on-tickets', async (_event, ticketCount: number) => {
    if (ticketSearchParameters === undefined) {
      console.warn(`got event on-ticket but ticketSearchParameters is undefined`);
      return;
    }

    console.log(`Found tickets ${ticketCount}`);

    if (ticketCount > 0) {
      console.log(`SUCCESS`);
      shell.openExternal(belaviaHandler.lastUrl)
      return;
    }

    if (directionIndex < ticketSearchParameters.directions.length - 1) {
      directionIndex++;

      const direction = ticketSearchParameters.directions[directionIndex];

      await sleep(Math.round((ticketSearchParameters.delayMax - ticketSearchParameters.delayMin) * Math.random() + ticketSearchParameters.delayMin));
      findTickets(direction.from, direction.to, currentDate);

      return;
    }

    // дошли до конца дат
    if (directionIndex === ticketSearchParameters.directions.length - 1) {

      directionIndex = 0;
    } else {
      directionIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);

    const dayAfterMax = new Date(ticketSearchParameters.dateTo.getTime());
    dayAfterMax.setDate(dayAfterMax.getDate() + 1);

    if (currentDate.getTime() > dayAfterMax.getTime()) {
      console.log('start searching from the beginning', currentDate, dayAfterMax);

      directionIndex = 0;
      currentDate.setTime(ticketSearchParameters.dateFrom.getTime());
    }

    const direction = ticketSearchParameters.directions[directionIndex];
    await sleep(Math.round((ticketSearchParameters.delayMax - ticketSearchParameters.delayMin) * Math.random() + ticketSearchParameters.delayMin));
    findTickets(direction.from, direction.to, currentDate);
  });
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
