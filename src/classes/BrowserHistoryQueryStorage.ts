import isEqual from 'lodash/isEqual';
import { interval, Observable, Observer } from 'rxjs';
import { debounce, share } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

import { IObservableStorage, IParams } from '../interfaces/IObservableStorage';
import { IStorage } from '../main';
import { isNumeric } from '../utils/isNumeric';

/**
 * Note: We are not using array query params in the Collboard
 * TODO: This is taken from CollBoard and should be reviewed - this should be part of some storage
 *
 */
export class BrowserHistoryQueryStorage<TParams extends IParams>
    implements IObservableStorage<TParams> {
    public values: Observable<TParams>;
    private lastParams: TParams;
    private urlsObserver: Observer<TParams>;

    constructor(
        defaultParams: TParams,
        private serializedStorage: IStorage<TParams>,
    ) {
        // ------------- Observing the browser state
        this.values = Observable.create((observer: Observer<TParams>) => {
            // this.valuesObserver = observer;

            window.addEventListener('popstate', (event) => {
                const paramsFromState = event.state as TParams /* TODO:  !!! Check and separate*/;
                this.lastParams = paramsFromState;
                observer.next(paramsFromState);
            });

            const params = this.getParamsFromUrl(Object.keys(defaultParams));

            this.lastParams = params as TParams;
            observer.next(params as TParams);
        }).pipe(share()); // TODO: Maybe publish or none

        // ------------- Pushing state to browser
        const urls: Observable<TParams> = Observable.create(
            (observer: Observer<TParams>) => {
                this.urlsObserver = observer;
            },
        ).pipe(
            debounce(() =>
                interval(
                    1000 /* TODO: Is there some better solution then debouncing with interval? */,
                ),
            ),
        );

        urls.subscribe((params) => {
            // console.log(`params`, params, this.lastParams);

            if (isEqual(params, this.lastParams)) {
                // Preventing pushing same state twice
                return;
            }
            // console.log(`router PUSHING STATE`, params);

            this.lastParams = params;
            window.history.pushState(
                params,
                window.document.title /* TODO: Is this a good solution? */,
                this.createUpdatedUrl(params).toString(),
            );

            this.serializedStorage.setItem('params', params);
        });

        this.loadInitialParams(defaultParams);
    }

    public pushValues(params: TParams) {
        this.urlsObserver.next(params);
    }

    public dispose() {
        /*  TODO: Implement */
    }

    private async loadInitialParams(defaultParams: TParams) {
        // TODO: !!! Iterate through all params and pick each
        const params =
            (this.getParamsFromUrl(Object.keys(defaultParams)) as TParams) ||
            (await this.serializedStorage.getItem('params')) ||
            defaultParams;

        // console.log('initialParams', initialParams);

        this.lastParams = params;
        window.history.replaceState(
            params,
            window.document.title /* TODO: Is this a good solution? */,
            this.createUpdatedUrl(params).toString(),
        );
    }

    private getParamsFromUrl(keys: Array<keyof TParams>): Partial<TParams> {
        const url = new URL(window.location.toString());
        const params: Partial<TParams> = {};
        for (const key of keys) {
            let value: string | number | null = url.searchParams.get(
                key as any,
            );
            if (isNumeric(value)) {
                value = parseFloat(value as any);
            }
            (params as any)[key] = value;
        }

        return params as TParams;
    }

    private createUpdatedUrl(params: TParams): URL {
        const url = new URL(window.location.toString());

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

        return url;
    }
}
