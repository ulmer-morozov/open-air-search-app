import { contextBridge, ipcRenderer } from "electron";
import { ITicketSearchParameters } from "./ITicketSearchParameters";
import { IControlPreloadContracts } from './IControlPreloadContracts';

const contracts: IControlPreloadContracts = {
    getSettings: () => {
        return ipcRenderer.invoke('get-settings');
    },
    searchTickets: (pars: ITicketSearchParameters): void => {
        ipcRenderer.invoke('search-tickets-start', pars);
    },
    stopSearch: (): void => {
        ipcRenderer.invoke('search-tickets-stop');
    }
}

contextBridge.exposeInMainWorld('contracts', contracts);