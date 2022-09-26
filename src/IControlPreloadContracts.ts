import { ITicketSearchParameters } from "./ITicketSearchParameters";

export interface IControlPreloadContracts {
    getSettings(): Promise<ITicketSearchParameters>;
    searchTickets(pars: ITicketSearchParameters): void;
    stopSearch(): void;
}
