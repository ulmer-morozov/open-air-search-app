import { ipcRenderer } from 'electron'
import { ApiError } from './ApiError';
import { IBelaviaPreloadContracts } from './IBelaviaPreloadContracts';
import { TicketResponse } from './TicketResponse';
import { sleep } from './browser-utils';

(window as any).contracts = {
    onTickets: (ticketCount) => {
        ipcRenderer.invoke('on-tickets', ticketCount);
    },
    getSettings: () => {
        return ipcRenderer.invoke('get-settings');
    }
} as IBelaviaPreloadContracts;

// contextBridge.exposeInMainWorld('contracts', contracts);

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

    console.log('XMLHttpRequest open patched from preload');
    openArgumentsMap.set(this, openArguments);

    return proxiedOpen.apply(this, [].slice.call(openArguments));
};

async function processApiResponse(url: string, requestData: Document | XMLHttpRequestBodyInit | null, responseData: string): Promise<void> {
    // console.log('processApiResponse');

    if (url != undefined && url.includes('/api/dc/products/air/search/') && typeof requestData === 'string') {
        // const ticketsRequest: TicketsRequest = JSON.parse(requestData);
        const ticketsResponse: TicketResponse = JSON.parse(responseData);

        const tickets = ticketsResponse.unbundledOffers?.flat() ?? [];

        console.log(`Найдено билетов: ${tickets.length}`);

        // contracts.onTickets(tickets.length);

        if (tickets.length === 0) {
            // идем дальше
            (window as any).contracts.onTickets(tickets.length);
            return;
        }
        

        await sleep(100);

        (window as any).ticketFoundHandler(tickets.length);
    }
}