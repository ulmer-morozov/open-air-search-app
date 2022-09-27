import { IDirection } from "./IDirection";

export function dateNowUtc(): Date {
    const date = new Date();

    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    debugger;
    return utcDate;
}

export function sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
}


export function cleanDirections(text: string): string {
    const directions = parseDirections(text);
    return stringifyDirections(directions);
}

export function stringifyDirections(directions: IDirection[]): string {
    const newText = directions
        .map(x => `${x.from} ${x.to}`)
        .join('\n');

    return newText + '\n';
}

export function parseDirections(text: string): IDirection[] {
    const directions = text
        .split(/\r|\n/)
        .map(x => x.trim())
        .filter(x => x.length > 0)
        .map(x => x.split(' ').map(y => y.toUpperCase().trim()).filter(z => z.length > 0))
        .filter(x => x.length === 2)
        .map(x => ({ from: x[0], to: x[1] } as IDirection));

    return directions;
}