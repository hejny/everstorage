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
    protected decodeUrl(url: URL): Partial<TValue> {
        const params: ISerialized = {};
        for (const key of Object.keys(this.defaultValue)) {
            let value: string | number | null = url.searchParams.get(
                key as any,
            );
            if (isNumeric(value)) {
                value = parseFloat(value as any);
            } else if (typeof value === 'string' && JSON_LIKE.test(value)) {
                value = JSON.parse(value as any);
            }
            (params as any)[key] = value;
        }

        return this.serializer.deserialize(params);
    }

    protected encodeUrl(params: TValue, lastUrl: URL): URL {
        // Note: deep clonning to prevent mutating
        const url = new URL(lastUrl.toString());

        for (const [key, value] of Object.entries(
            this.serializer.serialize(
                params /* TODO: Bit inefficient, maybe cache on level of Serializer */,
            ),
        )) {
            // console.log(key, value);

            if (value === null || value === undefined) {
                url.searchParams.delete(key);
            } else {
                // TODO: Maybe some flattening to not to pass ugly GET params in JSON format
                const valueString =
                    typeof value === 'object'
                        ? JSON.stringify(value)
                        : value.toString();

                url.searchParams.set(key, valueString);
            }
        }

        return url;
    }
}

const JSON_LIKE = /\{.*\}/; // /s; // TODO: Better
