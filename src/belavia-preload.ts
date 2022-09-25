import { contextBridge, ipcRenderer } from 'electron'
import { IBelaviaPreloadContracts } from './IBelaviaPreloadContracts';

const contracts: IBelaviaPreloadContracts = {
    chrome: () => process.versions.chrome,
    onTickets: (ticketCount) => {
        ipcRenderer.invoke('on-tickets', ticketCount);
    }
}

contextBridge.exposeInMainWorld('contracts', contracts);