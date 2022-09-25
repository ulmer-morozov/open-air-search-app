import { IDirection } from "./IDirection";

type Constructor<T> = new (...args: unknown[]) => T;

export function getElementById<T extends HTMLElement>(id: string, elType: Constructor<T>): T {
    const element = document.getElementById(id);

    if (element === undefined || element === null)
        throw new Error(`element with id = ${id} not found`);

    if (element instanceof elType)
        return element;

    throw new Error(`element with id = ${id} is not instance of ${elType.name}, its ${typeof element}`);
}

export function getInputById(id: string): HTMLInputElement {
    return getElementById(id, HTMLInputElement);
}

export function getTextareaById(id: string): HTMLTextAreaElement {
    return getElementById(id, HTMLTextAreaElement);
}

export function cleanDirections(text: string): string {
    const directions = parseDirections(text);

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