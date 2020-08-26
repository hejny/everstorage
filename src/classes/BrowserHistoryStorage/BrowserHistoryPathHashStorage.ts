import {
    IObservableStorage,
    IParams,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../main';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';

export class BrowserHistoryPathHashStorage<TParams extends IParams>
    extends AbstractBrowserHistoryStorage<TParams>
    implements IObservableStorage<TParams> {
    constructor(
        private decodeUrlPathHash: (url: string) => TParams,
        private encodeUrlPathHash: (params: TParams) => string,
        defaultParams: TParams,
        serializedStorage: IStorage<TParams>,
    ) {
        super(defaultParams, serializedStorage);
    }

    protected decodeUrl(url: string): Partial<TParams> {
        console.log(this);
        console.log(this.decodeUrlPathHash);

        const urlObject = new URL(url);
        const parsing = /#?\/+(?<route>.*)/.exec(urlObject.hash);
        if (!parsing || !parsing.groups) {
            return this.decodeUrlPathHash('/');
            // throw new Error(`Error while parsing url.`);
        }
        const { route } = parsing.groups;
        return this.decodeUrlPathHash('/' + route);
    }

    protected encodeUrl(params: TParams, lastUrl: string): string {
        const urlObject = new URL(lastUrl);
        urlObject.hash = '#' + this.encodeUrlPathHash(params);
        return urlObject.toString();
    }
}
