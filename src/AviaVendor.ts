export enum AviaVendor {
    NotSet = '',
    Belavia = 'BELAVIA',
    Turkish = 'TURKISH'
}

export const AviaVendors: AviaVendor[] = Object
    .values(AviaVendor)
    .filter(value => typeof value === 'string' && value.length > 0);