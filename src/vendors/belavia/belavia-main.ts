
export declare const BELAVIA_WEBPACK_ENTRY: string;
export declare const BELAVIA_PRELOAD_WEBPACK_ENTRY: string;

console.log(`BELAVIA_WEBPACK_ENTRY: ${BELAVIA_WEBPACK_ENTRY}`);
console.log(`BELAVIA_PRELOAD_WEBPACK_ENTRY: ${BELAVIA_PRELOAD_WEBPACK_ENTRY}`);

export function formatUTCDate(date: Date): string {
    const monthFormatted = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = date.getUTCDate().toString().padStart(2, '0');

    const dateString = `${date.getUTCFullYear()}${monthFormatted}${dateFormatted}`;
    return dateString;
}

