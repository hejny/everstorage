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

    protected decodeUrl(url: URL): Partial<TValue> {
        const parsing = /#?\/+(?<route>.*)/.exec(url.hash);
        if (!parsing || !parsing.groups) {
            return this.decodeUrlPathHash('/');
            // throw new Error(`Error while parsing url.`);
        }
        const { route } = parsing.groups;
        return this.decodeUrlPathHash('/' + route);
    }

    protected encodeUrl(params: TValue, lastUrl: URL): URL {
        // Note: deep clonning to prevent mutating
        const urlObject = new URL(lastUrl.toString());
        urlObject.hash = '#' + this.encodeUrlPathHash(params);
        return urlObject;
    }
}
