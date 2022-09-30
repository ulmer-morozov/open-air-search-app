import { ITicketSearchParameters } from './ITicketSearchParameters';
import { ITicketFoundData } from './ITicketFoundData';

export interface IBelaviaPreloadContracts {
    onTickets(date: ITicketFoundData): void;
    getSettings(): Promise<ITicketSearchParameters>;
    openUrlInBrowser(url: string): void;
}
