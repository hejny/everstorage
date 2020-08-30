import isEqual from 'lodash/isEqual';
import { interval, Observable, Observer } from 'rxjs';
import { debounce, share } from 'rxjs/operators';
import { forImmediate, forValueDefined } from 'waitasecond';

import {
    IObservableStorage,
    IParams,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../interfaces/IStorage';
import { createUniqueIdentifierFromParams } from '../../utils/createUniqueIdentifierFromParams';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

export abstract class AbstractBrowserHistoryStorage<TParams extends IParams>
    implements IObservableStorage<TParams> {
    public values: Observable<TParams>;
    private lastParams: TParams;
    private urlsObserver?: Observer<TParams>;
    private valuesObserver?: Observer<TParams>;
    private options: IBrowserHistoryStorageOptions;
    private uniqueIdentifier: string;

    constructor(
        readonly defaultParams: TParams,
        private serializedStorage: IStorage<TParams>,
        partialOptions?: Partial<IBrowserHistoryStorageOptions>,
    ) {
        this.uniqueIdentifier = this.createUniqueIdentifier(); // TODO: Check collisions globally

        this.options = {
            debounceInterval: 0,
            ...partialOptions,
        };

        this.init();
    }

    public async pushValues(paramsPartial: Partial<TParams>): Promise<void> {
        // TODO: Partial is working and I do not know why? Maybe Localstorage
        // this.urlsObserver.next(params as TParams);

        const params = {
            ...(this.lastParams as object),
            ...(paramsPartial as object),
        } as TParams;

        const urlsObserver = await forValueDefined(() => this.urlsObserver);
        urlsObserver.next(params);
        const valuesObserver = await forValueDefined(() => this.valuesObserver);
        // TODO: Maybe this behaviour (putting into values values pushed by user) should be in the options
        valuesObserver.next(params);
    }

    public dispose() {
        /*  TODO: Implement */
    }

    protected abstract decodeUrl(url: string): Partial<TParams>;
    protected abstract encodeUrl(params: TParams, lastUrl: string): string;

    protected createUniqueIdentifier() {
        return createUniqueIdentifierFromParams(this.defaultParams);
    }

    private async init() {
        // ------------- Observing the browser state
        this.values = Observable.create((observer: Observer<TParams>) => {
            this.valuesObserver = observer;

            window.addEventListener('popstate', (event) => {
                const paramsFromState = event.state as TParams & {
                    uniqueIdentifier: string;
                };
                if (
                    paramsFromState.uniqueIdentifier !== this.uniqueIdentifier
                ) {
                    return;
                }
                delete paramsFromState.uniqueIdentifier;
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
                { uniqueIdentifier: this.uniqueIdentifier, ...(params as {}) },
                window.document.title /* TODO: Is this a good solution? */,
                this.encodeUrl(params, window.location.toString()),
            );

            this.serializedStorage.setItem(this.uniqueIdentifier, params);
        });

        this.loadInitialParams();
    }

    private async loadInitialParams() {
        const urlParams = this.decodeUrl(window.location.toString()) as TParams;
        const storageParams =
            (await this.serializedStorage.getItem(this.uniqueIdentifier)) || {};

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
        const valuesObserver = await forValueDefined(() => this.valuesObserver);
        // TODO: Maybe this behaviour (putting into values initial values) should be in the options
        valuesObserver.next(params as TParams);
        window.history.replaceState(
            { uniqueIdentifier: this.uniqueIdentifier, ...(params as {}) },
            window.document.title /* TODO: Is this a good solution? */,
            this.encodeUrl(params as TParams, window.location.toString()),
        );
    }
}
