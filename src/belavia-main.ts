import { BrowserView } from "electron";
import { injectScript } from "./node-utils";
import { IAviaHandler } from './IAviaHandler';
import { FindTicketsData } from "./FindTicketsData";

declare const BELAVIA_WEBPACK_ENTRY: string;
declare const BELAVIA_PRELOAD_WEBPACK_ENTRY: string;

console.log(`BELAVIA_WEBPACK_ENTRY: ${BELAVIA_WEBPACK_ENTRY}`);
console.log(`BELAVIA_PRELOAD_WEBPACK_ENTRY: ${BELAVIA_PRELOAD_WEBPACK_ENTRY}`);

function formatDate(date: Date): string {
    const monthFormatted = (date.getMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = date.getDate().toString().padStart(2, '0');

    const dateString = `${date.getFullYear()}${monthFormatted}${dateFormatted}`;
    return dateString;
}

export class BelaviaHandler implements IAviaHandler {
    public readonly view: BrowserView;

    private _lastUrl = '';

    constructor() {
        this.view = new BrowserView({
            webPreferences: {
                preload: BELAVIA_PRELOAD_WEBPACK_ENTRY
            }
        });

        const webContents = this.view.webContents;

        webContents.on('did-finish-load', async () => {
            console.log('belaviaView did-finish-load');

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
        const journey = `${airportFrom}${airportTo}${formatDate(date)}`;

        this._lastUrl = `https://ibe.belavia.by/select?journeyType=Ow&journey=${journey}&adults=1&children=0&infants=0&lang=en`;

        console.log(`lastUrl: ${this._lastUrl}`);

        this.view.webContents.loadURL(this._lastUrl);
        // this.view.webContents.loadURL("https://google.com");
    }

}