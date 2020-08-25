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
    private valuesObserver: Observer<TParams>;

    constructor(
        defaultParams: TParams,
        private serializedStorage: IStorage<TParams>,
    ) {
        // ------------- Observing the browser state
        this.values = Observable.create((observer: Observer<TParams>) => {
            this.valuesObserver = observer;

            window.addEventListener('popstate', (event) => {
                const paramsFromState = event.state as TParams /* TODO:  !!! Check and separate*/;
                this.lastParams = paramsFromState;
                observer.next(paramsFromState);
            });
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

    public pushValues(params: Partial<TParams>) {
        // TODO: Partial is working and I do not know why? Maybe Localstorage
        // this.urlsObserver.next(params as TParams);
        this.urlsObserver.next({
            ...(this.lastParams as object),
            ...(params as object),
        } as TParams);
    }

    public dispose() {
        /*  TODO: Implement */
    }

    private async loadInitialParams(defaultParams: TParams) {
        const urlParams = this.getParamsFromUrl(
            Object.keys(defaultParams),
        ) as TParams;
        const storageParams =
            (await this.serializedStorage.getItem('params')) || {};

        const params: Partial<TParams> = {};
        for (const key of Object.keys(defaultParams)) {
            (params as any)[key] =
                urlParams[key] || storageParams[key] || defaultParams[key];
        }

        /*
        console.log('urlParams', urlParams);
        console.log('storageParams', storageParams);
        console.log('defaultParams', defaultParams);
        console.log('params', params);
        */

        this.lastParams = params as TParams;
        this.valuesObserver.next(params as TParams);
        window.history.replaceState(
            params,
            window.document.title /* TODO: Is this a good solution? */,
            this.createUpdatedUrl(params as TParams).toString(),
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
