import { ipcRenderer, shell } from 'electron'
import { ApiError } from '../../ApiError';
import { IBelaviaPreloadContracts } from '../../IBelaviaPreloadContracts';
import { TicketResponse } from '../../TicketResponse';
import { ITicketFoundData } from '../../ITicketFoundData';

(window as any).contracts = {
    onTickets: (data: ITicketFoundData) => {
        ipcRenderer.invoke('on-tickets', data);
    },
    getSettings: () => {
        return ipcRenderer.invoke('get-settings');
    },
    openUrlInBrowser: (url: string): void => {
        shell.openExternal(url);
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

        // console.log(`OTHER REQUEST ${request.status}`, url, requestJson, responseText);

        if (request.status >= 300) {
            const error: ApiError = JSON.parse(responseText);
            console.error(`${error.errorCode}. ${error.status}. ${error.type}. ${error.message}`)
            return;
        }

        // @ts-ignore:next-line
        processApiResponse(url, requestJson, responseText);
    });

    // @ts-ignore:next-line
    return proxiedSend.apply(this, [].slice.call(sendArguments));
};


const proxiedOpen = window.XMLHttpRequest.prototype.open;

(window.XMLHttpRequest.prototype.open as any) = function (...openArguments: Parameters<typeof window.XMLHttpRequest.prototype.open>) {
    // console.log('XMLHttpRequest open patched from preload');

    // @ts-ignore:next-line
    openArgumentsMap.set((this), openArguments);

    // @ts-ignore:next-line// @ts-ignore:next-line
    return proxiedOpen.apply(this, [].slice.call(openArguments));
};

async function processApiResponse(url: string, requestData: Document | XMLHttpRequestBodyInit | null, responseData: string): Promise<void> {

    if (url != undefined && url.includes('/api/dc/products/air/search/') && typeof requestData === 'string') {
        const ticketsResponse: TicketResponse = JSON.parse(responseData);

        const tickets = ticketsResponse.unbundledOffers?.flat() ?? [];
        (window as any).ticketFoundHandler(tickets.length);
    }
}