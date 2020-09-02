import { isNullOrUndefined } from 'util';

import {
    IObservableStorage,
    IValue,
} from '../../interfaces/IObservableStorage';
import { isNumeric } from '../../utils/isNumeric';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';

/**
 * Note: Not suppoting array query params
 * TODO: Order of GET params
 *
 */
export class BrowserHistoryQueryStorage<TValue extends IValue>
    extends AbstractBrowserHistoryStorage<TValue>
    implements IObservableStorage<TValue> {
    protected decodeUrl(url: string): Partial<TValue> {
        const urlObject = new URL(url);
        const params: Partial<TValue> = {};
        for (const key of Object.keys(this.defaulTValue)) {
            let value: string | number | null = urlObject.searchParams.get(
                key as any,
            );
            if (isNumeric(value)) {
                value = parseFloat(value as any);
            }
            (params as any)[key] = value;
        }

        return params as TValue;
    }

    protected encodeUrl(params: TValue, lastUrl: string): string {
        const url = new URL(lastUrl);

        for (const [key, value] of Object.entries(params)) {
            if (
                isNullOrUndefined(
                    /** @deprecated since v4.0.0 - use `value === null || value === undefined` instead. */
                    value,
                )
            ) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value.toString());
            }
        }

        return url.toString();
    }
}
