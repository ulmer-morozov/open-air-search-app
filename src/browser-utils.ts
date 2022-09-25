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
    const parts = text
        .split(/\r|\n/)
        .map(x => x.trim().replace(/ {2}/g, ' '))
        .filter(x => x.length > 0);

    return parts.join('\r')
}