import {
    IObservableStorage,
    IParams,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../main';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

// TODO: Maybe some more elegant way how to do this
let instanced = false;
export class BrowserHistoryPathStorage<TParams extends IParams>
    extends AbstractBrowserHistoryStorage<TParams>
    implements IObservableStorage<TParams> {
    constructor(
        private decodeUrlPath: (url: string) => TParams,
        private encodeUrlPath: (params: TParams) => string,
        defaultParams: TParams,
        serializedStorage: IStorage<TParams>,
        options?: IBrowserHistoryStorageOptions,
    ) {
        super(defaultParams, serializedStorage, options);

        if (instanced) {
            /* tslint:disable: no-console*/
            console.warn(
                `BrowserHistoryPathStorage has more than one instance. This can cause malfunctioning of the app.`,
            );
        } else {
            instanced = true;
        }
    }

    protected decodeUrl(url: string): Partial<TParams> {
        const urlObject = new URL(url);
        return this.decodeUrlPath(urlObject.pathname);
    }

    protected encodeUrl(params: TParams, lastUrl: string): string {
        const urlObject = new URL(lastUrl);
        urlObject.pathname = this.encodeUrlPath(params);
        return urlObject.toString();
    }
}
