import { isNullOrUndefined } from 'util';

import {
    IObservableStorage,
    IParams,
} from '../../interfaces/IObservableStorage';
import { isNumeric } from '../../utils/isNumeric';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';

/**
 * Note: Not suppoting array query params
 *
 */
export class BrowserHistoryQueryStorage<TParams extends IParams>
    extends AbstractBrowserHistoryStorage<TParams>
    implements IObservableStorage<TParams> {
    protected decodeUrl(url: string): Partial<TParams> {
        const urlObject = new URL(url);
        const params: Partial<TParams> = {};
        for (const key of Object.keys(this.defaultParams)) {
            let value: string | number | null = urlObject.searchParams.get(
                key as any,
            );
            if (isNumeric(value)) {
                value = parseFloat(value as any);
            }
            (params as any)[key] = value;
        }

        return params as TParams;
    }

    protected encodeUrl(params: TParams, lastUrl: string): string {
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
