import { ITicketSearchParameters } from "./ITicketSearchParameters";


export interface IControlPreloadContracts {
    searchTickets(pars: ITicketSearchParameters): void;
    stopSearch(): void;
}
