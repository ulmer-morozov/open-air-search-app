import { ApiError } from "./ApiError";
import { beep } from "./browser-utils";
import { IBelaviaPreloadContracts } from "./IBelaviaPreloadContracts";
import { ITicketSearchParameters } from "./ITicketSearchParameters";
import { TicketResponse } from "./TicketResponse";
import { TicketsRequest } from "./TicketsRequest";

// eslint-disable-next-line @typescript-eslint/no-var-requires

declare const contracts: IBelaviaPreloadContracts;

console.log(`👋 Попробуем найти билетики!`);

let snd: HTMLAudioElement | undefined;

document.addEventListener('keydown', () => stopAudioSignal());

function stopAudioSignal(): void {
    if (snd === undefined || snd === null)
        return;

    snd.pause();
    snd.remove();

    snd = undefined;
}

function processApiResponse(url: string, requestData: Document | XMLHttpRequestBodyInit | null, responseData: string) {
    // console.log('processApiResponse');

    if (url != undefined && url.includes('/api/dc/products/air/search/') && typeof requestData === 'string') {
        const ticketsRequest: TicketsRequest = JSON.parse(requestData);
        const ticketsResponse: TicketResponse = JSON.parse(responseData);

        const tickets = ticketsResponse.unbundledOffers?.flat() ?? [];

        console.log(`Найдено билетов: ${tickets.length}`);

        contracts.onTickets(tickets.length);

        if (tickets.length > 0) {
            snd = beep();
        }
    }
}

const openArgumentsMap = new Map();
const sendArgumentsMap = new Map();

const proxiedSend = window.XMLHttpRequest.prototype.send;

window.XMLHttpRequest.prototype.send = function (...sendArguments) {
    const request: XMLHttpRequest = this;
    const openArguments = openArgumentsMap.get(this);

    sendArgumentsMap.set(this, sendArguments);

    // console.log('open arguments', openArguments, 'send arguments', arguments);

    request.addEventListener("load", () => {
        openArgumentsMap.delete(request);
        sendArgumentsMap.delete(request);

        const url = openArguments[1];
        const requestJson = sendArguments[0];
        const responseText = this.responseText;

        console.log(`OTHER REQUEST ${request.status}`, url, requestJson, responseText);

        if (request.status >= 300) {
            const error: ApiError = JSON.parse(responseText);
            console.error(`${error.errorCode}. ${error.status}. ${error.type}. ${error.message}`)
            return;
        }

        processApiResponse(url, requestJson, responseText);
    });

    return proxiedSend.apply(this, [].slice.call(sendArguments));
};

const proxiedOpen = window.XMLHttpRequest.prototype.open;

(window.XMLHttpRequest.prototype.open as any) = function (...openArguments: Parameters<typeof window.XMLHttpRequest.prototype.open>) {
    openArgumentsMap.set(this, openArguments);

    // console.log('open arguments', arguments);

    return proxiedOpen.apply(this, [].slice.call(openArguments));
};