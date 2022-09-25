import { WebContents } from "electron";
import * as fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);

export function injectScript(webContents: WebContents, uri: string): void {
    if (uri.startsWith('file://')) {
        try {
            const scriptDataBuffer = fs.readFileSync(uri.replace('file://', ''));
            const scriptData = scriptDataBuffer.toString();

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
