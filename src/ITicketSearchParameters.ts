import { IDirection } from './IDirection';


export interface ITicketSearchParameters {
    dateFrom: Date;
    dateTo: Date;
    directions: IDirection[];
    delayMin: number;
    delayMax: number;

    adults: number;
    children: number;
    infants: number;

    autoFill: boolean;
    aproveTillPayment: boolean;

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

export function emptyTicketSearchParameters(): ITicketSearchParameters {
    return {
        dateFrom: new Date(0),
        dateTo: new Date(0),
        adults: 0,
        children: 0,
        infants: 0,
        directions: [],
        delayMin: 0,
        delayMax: 0,
        autoFill: false,
        aproveTillPayment: false,
        passengerTitle: "",
        lastName: "",
        firstName: "",
        nationality: "",
        dateOfBirth: undefined,
        documentNumber: "",
        documentExpirationDate: undefined,
        phoneCountry: "",
        restPhoneNumber: "",
        email: ""
    }
}