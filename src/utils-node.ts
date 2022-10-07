import { WebContents } from "electron";
import * as fs from 'fs';
import util from 'util';
import path from 'path';
import os from 'os';
import { ITicketSearchParameters } from "./ITicketSearchParameters";
import { dateNowUtc, tryParseDate } from "./utils-universal";
import { AviaVendor } from "./AviaVendor";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const configPath = path.join(os.homedir(), 'Desktop', 'air-search-app.json');

export function injectScript(webContents: WebContents, uri: string): void {

    // console.log('inject before ' + uri);

    // внутренняя схема для файлов
    if (uri.startsWith('file://')) {
        uri = uri.replace('file://', 'webpackfile://')
    }

    if (process.platform === 'win32') {
        // console.log('win!');
        path.normalize(uri);

        uri = uri.replace(/\\/g, '/');
    }

    // console.log('inject after ' + uri);

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
            adults: 1,
            children: 0,
            infants: 0,
            directions: [{ from: 'MSQ', to: 'BUS', vendor: AviaVendor.Belavia }, { from: 'MSQ', to: 'IST', vendor: AviaVendor.Belavia }],
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

    parsedConfig.adults ??= 1;
    parsedConfig.children ??= 0;
    parsedConfig.infants ??= 0;

    parsedConfig.dateTo = new Date(parsedConfig.dateTo);
    parsedConfig.dateFrom = new Date(parsedConfig.dateFrom);

    parsedConfig.dateOfBirth = tryParseDate(parsedConfig.dateOfBirth);
    parsedConfig.documentExpirationDate = tryParseDate(parsedConfig.documentExpirationDate);

    return parsedConfig;
}