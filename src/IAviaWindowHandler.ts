import { BrowserWindow } from 'electron';
import { ITicketSearchParameters } from "./ITicketSearchParameters";


export interface IAviaWindowHandler {
    readonly win: BrowserWindow;
    readonly lastUrl: string;
    findTickets(airportFrom: string, airportTo: string, date: Date, serchParameters: ITicketSearchParameters): void;
}
