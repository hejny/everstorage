import { IObservableStorage } from '../../interfaces/IObservableStorage';
import { ISerializable } from '../../interfaces/ISerializable';
import { ISerialized } from '../../interfaces/ISerialized';
import { IStorage } from '../../interfaces/IStorage';
import { Serializer } from '../../utils/Serializer';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

// TODO: Maybe some more elegant way how to do this
let instanced = false;
export class BrowserHistoryUrlStorage<TValue extends ISerializable>
    extends AbstractBrowserHistoryStorage<TValue>
    implements IObservableStorage<TValue>
{
    constructor(
        readonly decodeUrl: (url: URL) => TValue,
        readonly encodeUrl: (params: TValue) => URL,
        defaultValue: TValue /* TODO: !!! There is important to enumerate all keys */,
        options?: Partial<IBrowserHistoryStorageOptions>,
        storage?: IStorage<ISerialized>,
        serializer?: Serializer<TValue>,
    ) {
        super(defaultValue, options, storage, serializer);

        if (instanced) {
            /* tslint:disable: no-console*/
            console.warn(
                `BrowserHistoryUrlStorage has more than one instance. This can cause malfunctioning of the app.`,
            );
        } else {
            instanced = true;
        }
    }
}
