
 export interface SearchResultMetaData {
    branded: boolean;
    multipleDateResult: boolean;
    composedResult: boolean;
    interlineRoute: boolean;
    contextShopping: boolean;
}

export interface BrandedResults {
    itineraryPartBrands: any[][];
}

export interface TicketResponse {
    searchResultMetaData: SearchResultMetaData;
    unbundledOffers: any[][];
    unbundledAlternateDateOffers: any[][];
    brandedResults: BrandedResults;
    currency: string;
}