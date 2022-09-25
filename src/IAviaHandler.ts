import { BrowserView } from "electron";
import { FindTicketsData } from "./FindTicketsData";

export interface IAviaHandler {
    readonly view: BrowserView;
    readonly lastUrl: string;
    findTickets(airportFrom: string, airportTo: string, date: Date): void;
}
// Readonly<FindTicketsData>
