import { BrowserWindow } from "electron";
import { injectScript } from "../../utils-node";
import { IAviaWindowHandler } from "../../IAviaWindowHandler";
import { ITicketSearchParameters } from '../../ITicketSearchParameters';
import { controlsWindowWidth, sateliteWindowWidth, sateliteWindowWidthMax } from "../../constants";
import { BELAVIA_PRELOAD_WEBPACK_ENTRY, BELAVIA_WEBPACK_ENTRY } from "./belavia-main";
import { AviaVendor } from "../../AviaVendor";

function formatUTCDate(date: Date): string {
    const monthFormatted = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = date.getUTCDate().toString().padStart(2, '0');

    const dateString = `${date.getUTCFullYear()}${monthFormatted}${dateFormatted}`;
    return dateString;
}

export class BelaviaWindowHandler implements IAviaWindowHandler {
    public readonly vendor = AviaVendor.Belavia;
    public readonly win: BrowserWindow;

    private _lastUrl = '';

    constructor() {
        this.win = new BrowserWindow({
            width: sateliteWindowWidth,
            height: 700,
            minWidth: sateliteWindowWidth,
            maxWidth: sateliteWindowWidthMax,
            webPreferences: {
                preload: BELAVIA_PRELOAD_WEBPACK_ENTRY,
                contextIsolation: false
            }
        });

        // убирает синхронизацию заголовка с <title> страницы html
        this.win.on('page-title-updated', (e) => {
            e.preventDefault();
        });

        const webContents = this.win.webContents;

        webContents.on('dom-ready', async () => {
            console.log('belaviaView dom-ready');

            injectScript(webContents, BELAVIA_WEBPACK_ENTRY);
        });

        this.win.maximize();
        const position = this.win.getPosition();
        this.win.setPosition(controlsWindowWidth, position[1]);
    }

    public get lastUrl(): string {
        return this._lastUrl;
    }

    public searchTickets(airportFrom: string, airportTo: string, date: Date, serchParameters: ITicketSearchParameters): void {
        const journey = `${airportFrom}${airportTo}${formatUTCDate(date)}`;

        this._lastUrl = `https://ibe.belavia.by/select?journeyType=Ow&journey=${journey}&adults=${serchParameters.adults}&children=${serchParameters.children}&infants=${serchParameters.infants}&lang=ru`;

        // console.log(`lastUrl: ${this._lastUrl}`);
        this.win.webContents.loadURL(this._lastUrl);

        if (!this.win.webContents.isDevToolsOpened())
            this.win.webContents.openDevTools({ mode: 'bottom' });

        this.win.setTitle(`${airportFrom} --> ${airportTo}  | ${date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    }
}
