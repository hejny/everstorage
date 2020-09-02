import {
    IObservableStorage,
    IValue,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../main';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

// TODO: Maybe some more elegant way how to do this
let instanced = false;
export class BrowserHistoryPathStorage<TValue extends IValue>
    extends AbstractBrowserHistoryStorage<TValue>
    implements IObservableStorage<TValue> {
    constructor(
        private decodeUrlPath: (url: string) => TValue,
        private encodeUrlPath: (params: TValue) => string,
        defaulTValue: TValue,
        serializedStorage: IStorage<TValue>,
        options?: Partial<IBrowserHistoryStorageOptions>,
    ) {
        super(defaulTValue, serializedStorage, options);

        if (instanced) {
            /* tslint:disable: no-console*/
            console.warn(
                `BrowserHistoryPathStorage has more than one instance. This can cause malfunctioning of the app.`,
            );
        } else {
            instanced = true;
        }
    }

    protected decodeUrl(url: string): Partial<TValue> {
        const urlObject = new URL(url);
        return this.decodeUrlPath(urlObject.pathname);
    }

    protected encodeUrl(params: TValue, lastUrl: string): string {
        const urlObject = new URL(lastUrl);
        urlObject.pathname = this.encodeUrlPath(params);
        return urlObject.toString();
    }
}
