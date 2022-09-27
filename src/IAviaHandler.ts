import { BrowserView } from "electron";
import { ITicketSearchParameters } from "./ITicketSearchParameters";

export interface IAviaHandler {
    readonly view: BrowserView;
    readonly lastUrl: string;
    findTickets(airportFrom: string, airportTo: string, date: Date, serchParameters: ITicketSearchParameters): void;
}
