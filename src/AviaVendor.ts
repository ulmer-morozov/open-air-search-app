export enum AviaVendor {
    Belavia = 'BELAVIA',
    Turkish = 'TURKISH'
}

export const AviaVendors = Object.values(AviaVendor).filter(value => typeof value === 'string') as AviaVendor[];