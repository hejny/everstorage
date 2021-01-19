import { IObservableStorage } from '../../interfaces/IObservableStorage';
import { ISerializable } from '../../interfaces/ISerializable';
import { ISerialized } from '../../interfaces/ISerialized';
import { IStorage } from '../../interfaces/IStorage';
import { Serializer } from '../../utils/Serializer';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

// TODO: Maybe some more elegant way how to do this
let instanced = false;

export interface IBrowserHistoryPathStorageArgs<TValue extends ISerializable> {
    // TODO: Use this pattern in whole project
    decodeUrlPath: (url: string) => TValue;
    encodeUrlPath: (params: TValue) => string;
    defaultValue: TValue;
    options?: Partial<IBrowserHistoryStorageOptions>;
    storage?: IStorage<ISerialized>;
    serializer?: Serializer<TValue>;
}

export class BrowserHistoryPathStorage<TValue extends ISerializable>
    extends AbstractBrowserHistoryStorage<TValue>
    implements IObservableStorage<TValue> {
    constructor(private args: IBrowserHistoryPathStorageArgs<TValue>) {
        super(args);

        if (instanced) {
            /* tslint:disable: no-console*/
            console.warn(
                `BrowserHistoryPathStorage has more than one instance. This can cause malfunctioning of the app.`,
            );
        } else {
            instanced = true;
        }
    }

    protected decodeUrl(url: URL): Partial<TValue> {
        return this.args.decodeUrlPath(url.pathname);
    }

    protected encodeUrl(params: TValue, lastUrl: URL): URL {
        // Note: deep clonning to prevent mutating
        const url = new URL(lastUrl.toString());
        url.pathname = this.args.encodeUrlPath(params);
        return url;
    }
}
