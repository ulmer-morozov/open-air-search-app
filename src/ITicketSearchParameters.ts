import { IDirection } from './IDirection';


export interface ITicketSearchParameters {
    dateFrom: Date;
    dateTo: Date;
    directions: IDirection[];
    delayMin: number;
    delayMax: number;

    autoFill: boolean;

    passengerTitle: string;
    lastName: string;
    firstName: string;
    nationality: string
    dateOfBirth?: Date;
    documentNumber: string
    documentExpirationDate?: Date;
    phoneCountry: string;
    restPhoneNumber: string;
    email: string;
}
