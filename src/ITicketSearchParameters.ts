import { IDirection } from './IDirection';


export interface ITicketSearchParameters {
    dateFrom: Date;
    dateTo: Date;
    directions: IDirection[];
    delayMin: number;
    delayMax: number;
}
