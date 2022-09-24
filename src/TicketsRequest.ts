export interface From {
    code: string;
}

export interface To {
    code: string;
}

export interface When {
    date: string;
}

export interface ItineraryPart {
    from: From;
    to: To;
    when: When;
}

export interface Passengers {
    ADT: number;
    CHD: number;
    INF: number;
}

export interface TicketsRequest {
    cabinClass: string;
    searchType: string;
    itineraryParts: ItineraryPart[];
    passengers: Passengers;
    pointOfSale: string;
    awardBooking: boolean;
    currency: string;
}
