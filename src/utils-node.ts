import { WebContents } from "electron";
import * as fs from 'fs';
import util from 'util';
import path from 'path';
import os from 'os';
import { ITicketSearchParameters } from "./ITicketSearchParameters";
import { dateNowUtc } from "./utils-universal";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const configPath = path.join(os.homedir(), 'Desktop', 'air-search-app.json');

export function injectScript(webContents: WebContents, uri: string): void {
    // if (uri.startsWith('file://')) {
    //     try {
    //         const scriptData = fs.readFileSync(uri.replace('file://', ''), { encoding: 'utf-8' });

    //         // переносы строки нужны, чтобы убрать влияние комментариев
    //         const script = "document.body.appendChild(`<script>\n" + scriptData.replace(/`/g,'\\`') + "\n</script>`)";
    //         console.log('\n\n\n');
    //         console.log(script);
    //         console.log('\n\n\n');

    //         webContents.executeJavaScript(script);

    //         return;
    //     }

    //     catch (e) {
    //         console.error(e);

    //         throw e;
    //     }
    // }

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

export async function storeSettings(config: ITicketSearchParameters): Promise<void> {
    const configJson = JSON.stringify(config);

    await writeFile(configPath, configJson);
}

export async function getStoredSettings(): Promise<ITicketSearchParameters> {
    if (!fs.existsSync(configPath)) {
        const defaultParameters: ITicketSearchParameters = {
            dateFrom: dateNowUtc(),
            dateTo: dateNowUtc(),
            directions: [{ from: 'MSQ', to: 'BUS' }, { from: 'MSQ', to: 'IST' }],
            delayMin: 1000,
            delayMax: 2000,
            autoFill: false,
            aproveTillPayment: false,
            passengerTitle: "Mr.",
            lastName: "",
            firstName: "",
            nationality: "Российская Федерация",
            dateOfBirth: undefined,
            documentNumber: "",
            documentExpirationDate: undefined,
            phoneCountry: "(+7) Российская Федерация",
            restPhoneNumber: "",
            email: ""
        }

        return defaultParameters;
    }

    const configJson = await readFile(configPath, { encoding: 'utf-8' });

    const parsedConfig: ITicketSearchParameters = JSON.parse(configJson);

    parsedConfig.dateTo = new Date(parsedConfig.dateTo);
    parsedConfig.dateFrom = new Date(parsedConfig.dateFrom);

    if ((parsedConfig.dateOfBirth as unknown as string)?.length > 0)
        parsedConfig.dateOfBirth = new Date(parsedConfig.dateOfBirth);

    if ((parsedConfig.documentExpirationDate as unknown as string)?.length > 0)
        parsedConfig.documentExpirationDate = new Date(parsedConfig.documentExpirationDate);

    return parsedConfig;
}