import { ITicketSearchParameters } from './ITicketSearchParameters';

export interface IBelaviaPreloadContracts {
    onTickets(count: number): void;
    getSettings(): Promise<ITicketSearchParameters>;
}
