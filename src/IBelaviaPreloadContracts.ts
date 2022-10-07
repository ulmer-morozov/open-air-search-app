import { ITicketSearchParameters } from './ITicketSearchParameters';
import { ITicketFoundData } from './ITicketFoundData';
import { ITicketBuyErrorData } from "./ITicketBuyErrorData";

export interface IBelaviaPreloadContracts {
    onTickets(data: ITicketFoundData): void;
    onTicketBuyError(data: ITicketBuyErrorData): void;
    getSettings(): Promise<ITicketSearchParameters>;
    openUrlInBrowser(url: string): void;
}
