import { IObservableStorage } from '../../interfaces/IObservableStorage';
import { ISerializable } from '../../interfaces/ISerializable';
import { ISerialized } from '../../interfaces/ISerialized';
import { isNumeric } from '../../utils/isNumeric';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';

/**
 * Note: Not suppoting array query params
 * TODO: Order of GET params
 *
 */
export class BrowserHistoryQueryStorage<TValue extends ISerializable>
    extends AbstractBrowserHistoryStorage<TValue>
    implements IObservableStorage<TValue> {
    protected decodeUrl(url: string): Partial<TValue> {
        const urlObject = new URL(url);
        const params: ISerialized = {};
        for (const key of Object.keys(this.defaultValue)) {
            let value: string | number | null = urlObject.searchParams.get(
                key as any,
            );
            if (isNumeric(value)) {
                value = parseFloat(value as any);
            }
            (params as any)[key] = value;
        }

        return this.serializer.deserialize(params);
    }

    protected encodeUrl(params: TValue, lastUrl: string): string {
        const url = new URL(lastUrl);

        for (const [key, value] of Object.entries(
            this.serializer.serialize(
                params /* TODO: Bit inefficient, maybe cache on level of Serializer */,
            ),
        )) {
            // console.log(key, value);

            if (value === null || value === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value.toString());
            }
        }

        return url.toString();
    }
}
