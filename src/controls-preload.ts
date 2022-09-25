import { contextBridge, ipcRenderer } from "electron";
import { ITicketSearchParameters } from "./ITicketSearchParameters";
import { IControlPreloadContracts } from './IControlPreloadContracts';

const contracts: IControlPreloadContracts = {
    searchTickets: (pars: ITicketSearchParameters): void => {
        ipcRenderer.invoke('search-tickets', pars);
    },
    stopSearch: (): void => {
        ipcRenderer.invoke('search-tickets-stop');
    }
}

contextBridge.exposeInMainWorld('contracts', contracts);