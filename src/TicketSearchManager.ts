import { shell } from "electron";
import { IAviaWindowHandler } from "./IAviaWindowHandler";
import { IDirection } from "./IDirection";
import { emptyTicketSearchParameters, ITicketSearchParameters } from './ITicketSearchParameters';
import { sleepRandom } from "./utils-universal";

export interface TicketSearchManagerParameters {
    windowHandler: IAviaWindowHandler;
}

export enum TicketSearchManagerStatus {
    NotSet = '',
    Stopped = 'Stopped',
    Searching = 'Searching',
    FoundTickets = 'FoundTickets'
}

export class TicketSearchManager {
    private readonly _windowHandler: IAviaWindowHandler;
    private readonly directions: IDirection[] = [];

    private _status = TicketSearchManagerStatus.Stopped;

    private currentDate = new Date();
    private currentDirectionIndex = 0;
    private currentParameters = emptyTicketSearchParameters();

    constructor(parameters: TicketSearchManagerParameters) {
        this._windowHandler = parameters.windowHandler;

        this.resetAllParameters();
    }

    public get status(): TicketSearchManagerStatus {
        return this._status;
    }

    public start(searchParameters: ITicketSearchParameters): void {
        if (this._status !== TicketSearchManagerStatus.Stopped) {
            console.warn(`Can not start searching ticket when status = ${this._status}`);
            return;
        }

        const newDirections = searchParameters.directions
            .filter(x => x.vendor === this._windowHandler.vendor);

        if (newDirections.length === 0)
            return;

        this.resetAllParameters();

        this.directions.push(...newDirections);
        this.currentParameters = searchParameters;
        this.currentDate.setTime(searchParameters.dateFrom.getTime());

        this.setStatus(TicketSearchManagerStatus.Searching);
        this.searchTicketsForCurrent();
    }

    public stop(): void {
        if (this._status !== TicketSearchManagerStatus.Searching) {
            console.warn(`Next was valled when status was = ${this._status}`);
            return;
        }

        // очищаем страницу
        this._windowHandler.win.webContents.loadURL("<p>поиск не активен</p>");

        this.resetAllParameters();
        this.setStatus(TicketSearchManagerStatus.Stopped);
    }

    public next(): void {
        if (this._status !== TicketSearchManagerStatus.Searching) {
            console.warn(`Next was valled when status was = ${this._status}`);
            return;
        }

        // перебираем направления
        if (this.currentDirectionIndex < this.currentParameters.directions.length - 1) {
            this.currentDirectionIndex++;

            this.searchTicketsForCurrent();
        }

        // дошли до последнего направления
        // переходим к следующей дате

        this.currentDirectionIndex = 0;
        this.currentDate.setDate(this.currentDate.getDate() + 1);

        if (this.currentDate > this.currentParameters.dateTo) {
            console.log(`start searching from the beginning: ${this._windowHandler.vendor}`);

            this.currentDate.setTime(this.currentParameters.dateFrom.getTime());
        }

        this.searchTicketsForCurrent();
    }

    public ticketsFound(count: number): void {
        if (this._status !== TicketSearchManagerStatus.Searching) {
            console.warn(`Next was valled when status was = ${this._status}`);
            return;
        }

        // открываем окно в браузере, если не планируем покупать билет через программу
        if (!this.currentParameters.autoFill) {
            shell.openExternal(this._windowHandler.lastUrl);
        }

        this.setStatus(TicketSearchManagerStatus.FoundTickets);
    }

    private async searchTicketsForCurrent(): Promise<void> {
        const direction = this.directions[this.currentDirectionIndex];

        if (direction === undefined || direction === null)
            throw new Error(`Direction not found. index: ${this.currentDirectionIndex}`);

        await sleepRandom(this.currentParameters.delayMin, this.currentParameters.delayMax);

        // если за это время уже вырубили поиск, то не открываем ничего
        if (this._status !== TicketSearchManagerStatus.Searching)
            return;

        this._windowHandler.searchTickets(direction.from, direction.to, this.currentDate, this.currentParameters);
    }

    private resetAllParameters(): void {
        this.currentDate.setTime(0);
        this.directions.splice(0, this.directions.length);

        this.currentDirectionIndex = 0;
        this.currentParameters = emptyTicketSearchParameters();
    }

    private setStatus(newStatus: TicketSearchManagerStatus): void {
        this._status = newStatus;
        // сюда можно прикрутить дополнительную отправку событий
    }
}