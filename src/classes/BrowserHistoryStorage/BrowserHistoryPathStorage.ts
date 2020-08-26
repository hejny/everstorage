import {
    IObservableStorage,
    IParams,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../main';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';

export class BrowserHistoryPathStorage<TParams extends IParams>
    extends AbstractBrowserHistoryStorage<TParams>
    implements IObservableStorage<TParams> {
    constructor(
        private decodeUrlPath: (url: string) => TParams,
        private encodeUrlPath: (params: TParams) => string,
        defaultParams: TParams,
        serializedStorage: IStorage<TParams>,
    ) {
        super(defaultParams, serializedStorage);
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
