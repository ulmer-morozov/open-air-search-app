import { BrowserWindow } from 'electron';
import { ITicketSearchParameters } from "./ITicketSearchParameters";
import { AviaVendor } from './AviaVendor';


export interface IAviaWindowHandler {
    readonly vendor: AviaVendor;
    readonly win: BrowserWindow;
    readonly lastUrl: string;

    searchTickets(airportFrom: string, airportTo: string, date: Date, serchParameters: ITicketSearchParameters): void;
}
