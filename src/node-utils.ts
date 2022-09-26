import { WebContents } from "electron";
import * as fs from 'fs';
import util from 'util';
import path from 'path';
import os from 'os';
import { ITicketSearchParameters } from "./ITicketSearchParameters";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const configPath = path.join(os.homedir(), 'Desktop', 'air-search-app.json');

export function injectScript(webContents: WebContents, uri: string): void {
    if (uri.startsWith('file://')) {
        try {
            const scriptData = fs.readFileSync(uri.replace('file://', ''), { encoding: 'utf-8' });

            console.log(scriptData);

            webContents.executeJavaScript(`
                const po = document.createElement('script');
                po.text = \`${scriptData}\`;
                document.body.appendChild(po);
            `);

            return;
        }

        catch (e) {
            console.error(e);

            throw e;
        }
    }

    webContents.executeJavaScript(`
        (function() {
          var po = document.createElement('script');
          po.type = 'text/javascript';
          po.async = true;
          po.src = '${uri}';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(po, s);
        })();
      `);
}

export function sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function storeSettings(config: ITicketSearchParameters): Promise<void> {
    const configJson = JSON.stringify(config);

    await writeFile(configPath, configJson);
}

export async function getStoredSettings(): Promise<ITicketSearchParameters> {
    if (!fs.existsSync(configPath)) {
        const defaultParameters: ITicketSearchParameters = {
            dateFrom: new Date(),
            dateTo: new Date(),
            directions: [{ from: 'MSQ', to: 'BUS' }, { from: 'MSQ', to: 'IST' }],
            delayMin: 1000,
            delayMax: 2000
        }

        return defaultParameters;
    }

    const configJson = await readFile(configPath, { encoding: 'utf-8' });

    const parsedConfig: ITicketSearchParameters = JSON.parse(configJson);

    parsedConfig.dateTo = new Date(parsedConfig.dateTo);
    parsedConfig.dateFrom = new Date(parsedConfig.dateFrom);

    return parsedConfig;
}