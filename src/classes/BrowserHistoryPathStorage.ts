import isEqual from 'lodash/isEqual';
import { interval, Observable, Observer } from 'rxjs';
import { debounce, share } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

import { IObservableStorage, IParams } from '../interfaces/IObservableStorage';
import { isNumeric } from '../utils/isNumeric';
import { ObjectStorage } from './ObjectStorage';

/**
 * Note: We are not using array query params in the Collboard
 * TODO: This is taken from CollBoard and should be reviewed - this should be part of some storage
 *
 */
export class BrowserHistoryPathStorage<TParams extends IParams>
    implements IObservableStorage<TParams> {
    public values: Observable<TParams>;
    private lastParams: TParams;
    private urlsObserver: Observer<TParams>;
    private serializedStorage: ObjectStorage<TParams>;

    constructor(defaultParams: TParams) {
        // ------------- Creating serializedStorage

        this.serializedStorage = new ObjectStorage<TParams>(localStorage);

        // ------------- Observing the browser state
        this.values = Observable.create((observer: Observer<TParams>) => {
            // this.valuesObserver = observer;

            window.addEventListener('popstate', (event) => {
                const paramsFromState = event.state as TParams /* TODO:  !!! Check and separate*/;
                this.lastParams = paramsFromState;
                observer.next(paramsFromState);
            });

            const url = new URL(window.location.toString());
            const params: Partial<TParams> = {};
            for (const key of Object.keys(defaultParams)) {
                let value: string | number | null = url.searchParams.get(
                    key as any,
                );
                if (isNumeric(value)) {
                    value = parseFloat(value as any);
                }
                (params as any)[key] = value;
            }
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

        // ------------- Initial params

        let initialParams = this.serializedStorage.getItem('params');

        if (!initialParams) {
            initialParams = defaultParams;
        }

        // console.log('initialParams', initialParams);

        this.lastParams = initialParams;
        window.history.replaceState(
            initialParams,
            window.document.title /* TODO: Is this a good solution? */,
            this.createUpdatedUrl(initialParams).toString(),
        );
    }

    public pushValues(params: TParams) {
        this.urlsObserver.next(params);
    }

    public dispose() {
        /*  TODO: Implement */
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
