import { IDirection } from "./IDirection";
import { AviaVendor, AviaVendors } from './AviaVendor';

export function dateNowUtc(): Date {
    const date = new Date();

    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate;
}

export function sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function sleepRandom(delayMin: number, delayMax: number): Promise<void> {
    return sleep(Math.round((delayMax - delayMin) * Math.random() + delayMin));
}

export function cleanDirections(text: string): string {
    const directions = parseDirections(text);
    return stringifyDirections(directions);
}

export function stringifyDirections(directions: IDirection[]): string {
    const newText = directions
        .map(x => `${x.from} ${x.to} ${x.vendor ?? AviaVendor.Belavia}`)
        .join('\n');

    return newText + '\n';
}

export function parseDirections(text: string): IDirection[] {
    const directions = text
        .split(/\r|\n/)
        .map(x => x.trim())
        .filter(x => x.length > 0)
        .map(x => x.split(' ').map(y => y.toUpperCase().trim()).filter(z => z.length > 0))
        .filter(x => x.length >= 2 && x.length <= 3)
        .map(x => ({ from: x[0], to: x[1], vendor: x[2] ?? AviaVendor.Belavia } as IDirection))
        .filter(x => AviaVendors.includes(x.vendor));

    return directions;
}

export function tryParseDate(input: Date | string | undefined | null): Date | undefined {
    if (input === undefined || input === null)
        return undefined;

    if (input instanceof Date && !isNaN(input.valueOf()))
        return input;

    if (typeof input === 'string' && input.trim().length === 0)
        return undefined;

    if (typeof input === 'string') {
        const parsedDate = new Date(input);
        return isNaN(parsedDate.valueOf()) ? undefined : parsedDate;
    }

    console.error(`Cannot parse date from`, input);
    throw new Error(`Cannot parse date from ${input}`);
}