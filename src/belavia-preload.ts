import { contextBridge, ipcRenderer } from 'electron'
import { IBelaviaPreloadContracts } from './IBelaviaPreloadContracts';

const contracts: IBelaviaPreloadContracts = {
    onTickets: (ticketCount) => {
        ipcRenderer.invoke('on-tickets', ticketCount);
    },
    getSettings: () => {
        return ipcRenderer.invoke('get-settings');
    }
}

contextBridge.exposeInMainWorld('contracts', contracts);