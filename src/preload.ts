import { contextBridge, ipcRenderer } from 'electron'
import { IPreloadContracts } from './IPreloadContracts';

const contracts: IPreloadContracts = {
    chrome: () => process.versions.chrome,
    onTickets: (ticketCount) => {
        ipcRenderer.invoke('on-tickets', ticketCount);
    }
}

contextBridge.exposeInMainWorld('contracts', contracts);