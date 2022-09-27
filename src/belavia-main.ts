import { BrowserView } from "electron";
import { injectScript } from "./utils-node";
import { IAviaHandler } from './IAviaHandler';
import { FindTicketsData } from "./FindTicketsData";

declare const BELAVIA_WEBPACK_ENTRY: string;
declare const BELAVIA_PRELOAD_WEBPACK_ENTRY: string;

console.log(`BELAVIA_WEBPACK_ENTRY: ${BELAVIA_WEBPACK_ENTRY}`);
console.log(`BELAVIA_PRELOAD_WEBPACK_ENTRY: ${BELAVIA_PRELOAD_WEBPACK_ENTRY}`);

function formatUTCDate(date: Date): string {
    const monthFormatted = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = date.getUTCDate().toString().padStart(2, '0');

    const dateString = `${date.getUTCFullYear()}${monthFormatted}${dateFormatted}`;
    return dateString;
}

export class BelaviaHandler implements IAviaHandler {
    public readonly view: BrowserView;

    private _lastUrl = '';

    constructor() {
        this.view = new BrowserView({
            webPreferences: {
                preload: BELAVIA_PRELOAD_WEBPACK_ENTRY,
                contextIsolation: false,
                webSecurity: false
            }
        });

        const webContents = this.view.webContents;

        webContents.on('dom-ready', async () => {
            console.log('belaviaView dom-ready');

            injectScript(webContents, BELAVIA_WEBPACK_ENTRY);
        });
    }

    public get lastUrl(): string {
        return this._lastUrl;
    }

    public getTickets(): Readonly<FindTicketsData> {
        throw new Error("Method not implemented.");
    }

    public findTickets(airportFrom: string, airportTo: string, date: Date): void {
        const journey = `${airportFrom}${airportTo}${formatUTCDate(date)}`;

        this._lastUrl = `https://ibe.belavia.by/select?journeyType=Ow&journey=${journey}&adults=1&children=0&infants=0&lang=ru`;

        console.log(`lastUrl: ${this._lastUrl}`);

        this.view.webContents.loadURL(this._lastUrl);
    }
}