import { IObservableStorage } from '../../interfaces/IObservableStorage';
import { ISerializable } from '../../interfaces/ISerializable';
import { ISerialized } from '../../interfaces/ISerialized';
import { IStorage } from '../../interfaces/IStorage';
import { Serializer } from '../../utils/Serializer';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

// TODO: Maybe some more elegant way how to do this
let instanced = false;
export class BrowserHistoryPathHashStorage<TValue extends ISerializable>
    extends AbstractBrowserHistoryStorage<TValue>
    implements IObservableStorage<TValue> {
    constructor(
        private decodeUrlPathHash: (url: string) => TValue,
        private encodeUrlPathHash: (params: TValue) => string,
        defaultValue: TValue,
        options?: Partial<IBrowserHistoryStorageOptions>,
        storage?: IStorage<ISerialized>,
        serializer?: Serializer<TValue>,
    ) {
        super(defaultValue, options, storage, serializer);

        if (instanced) {
            /* tslint:disable: no-console*/
            console.warn(
                `BrowserHistoryPathHashStorage has more than one instance. This can cause malfunctioning of the app.`,
            );
        } else {
            instanced = true;
        }
    }

    protected decodeUrl(url: string): Partial<TValue> {
        const urlObject = new URL(url);
        const parsing = /#?\/+(?<route>.*)/.exec(urlObject.hash);
        if (!parsing || !parsing.groups) {
            return this.decodeUrlPathHash('/');
            // throw new Error(`Error while parsing url.`);
        }
        const { route } = parsing.groups;
        return this.decodeUrlPathHash('/' + route);
    }

    protected encodeUrl(params: TValue, lastUrl: string): string {
        const urlObject = new URL(lastUrl);
        urlObject.hash = '#' + this.encodeUrlPathHash(params);
        return urlObject.toString();
    }
}
