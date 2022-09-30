import { AviaVendor } from './AviaVendor';

export interface IDirection {
    from: string;
    to: string;
    vendor: AviaVendor;
}

export function emptyDirection(): IDirection {
    return { from: '', to: '', vendor: AviaVendor.NotSet };
}