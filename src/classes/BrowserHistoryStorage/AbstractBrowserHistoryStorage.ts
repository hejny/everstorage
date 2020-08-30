import isEqual from 'lodash/isEqual';
import { interval, Observable, Observer } from 'rxjs';
import { debounce, share } from 'rxjs/operators';
import { forImmediate } from 'waitasecond';

import {
    IObservableStorage,
    IParams,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../interfaces/IStorage';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

export abstract class AbstractBrowserHistoryStorage<TParams extends IParams>
    implements IObservableStorage<TParams> {
    public values: Observable<TParams>;
    private lastParams: TParams;
    private urlsObserver: Observer<TParams>;
    private valuesObserver: Observer<TParams>;
    private options: IBrowserHistoryStorageOptions;

    constructor(
        readonly defaultParams: TParams,
        private serializedStorage: IStorage<TParams>,
        partialOptions?: Partial<IBrowserHistoryStorageOptions>,
    ) {
        this.options = {
            debounceInterval: 1000,
            ...partialOptions,
        };

        this.init();
    }

    public async pushValues(paramsPartial: Partial<TParams>) {
        // TODO: Partial is working and I do not know why? Maybe Localstorage
        // this.urlsObserver.next(params as TParams);

        const params = {
            ...(this.lastParams as object),
            ...(paramsPartial as object),
        } as TParams;

        this.urlsObserver.next(params);
        await forImmediate();
        /* TODO: Problem !!! ??? */ this.valuesObserver.next(params);
    }

    public dispose() {
        /*  TODO: Implement */
    }

    protected abstract decodeUrl(url: string): Partial<TParams>;
    protected abstract encodeUrl(params: TParams, lastUrl: string): string;

    private async init() {
        // ------------- Observing the browser state
        this.values = Observable.create((observer: Observer<TParams>) => {
            this.valuesObserver = observer;

            window.addEventListener('popstate', (event) => {
                const paramsFromState = event.state as TParams /* TODO:  !!!  Scope the state - Check and separate*/;
                this.lastParams = paramsFromState;
                observer.next(paramsFromState);
            });
        }).pipe(share()); // TODO: Maybe publish or none

        await forImmediate();

        // ------------- Pushing state to browser
        const urls: Observable<TParams> = Observable.create(
            (observer: Observer<TParams>) => {
                this.urlsObserver = observer;
            },
        ).pipe(
            debounce(() =>
                interval(
                    // TODO: Maybe when there is debounceInterval=0 there should be no pipe with debounce+interval
                    //  TODO: Is there some better solution then debouncing with interval?
                    this.options.debounceInterval,
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
                this.encodeUrl(params, window.location.toString()),
            );

            this.serializedStorage.setItem('params', params);
        });

        this.loadInitialParams();
    }

    private async loadInitialParams() {
        const urlParams = this.decodeUrl(window.location.toString()) as TParams;
        const storageParams =
            (await this.serializedStorage.getItem('params')) || {};

        const params: Partial<TParams> = {};
        for (const key of Object.keys(this.defaultParams)) {
            (params as any)[key] =
                urlParams[key] || storageParams[key] || this.defaultParams[key];
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
            this.encodeUrl(params as TParams, window.location.toString()),
        );
    }
}
