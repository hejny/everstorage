import isEqual from 'lodash/isEqual';
import { interval, Observable, Observer } from 'rxjs';
import { debounce, share } from 'rxjs/operators';
import { forImmediate, forValueDefined } from 'waitasecond';

import {
    IObservableStorage,
    IValue,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../interfaces/IStorage';
import { createUniqueIdentifierFromParams } from '../../utils/createUniqueIdentifierFromParams';
import { IBrowserHistoryStorageOptions } from './IBrowserHistoryStorageOptions';

export abstract class AbstractBrowserHistoryStorage<TValue extends IValue>
    implements IObservableStorage<TValue> {
    public values: Observable<TValue>;
    private lastValue: TValue;
    private urlsObserver?: Observer<TValue>;
    private valuesObserver?: Observer<TValue>;
    private options: IBrowserHistoryStorageOptions;
    private uniqueIdentifier: string;

    constructor(
        readonly defaulTValue: TValue,
        private serializedStorage: IStorage<TValue>,
        partialOptions?: Partial<IBrowserHistoryStorageOptions>,
    ) {
        this.uniqueIdentifier = this.createUniqueIdentifier(); // TODO: Check collisions globally

        this.options = {
            debounceInterval: 0,
            ...partialOptions,
        };

        this.init();
    }

    get value(): TValue {
        return this.lastValue;
    }

    public async pushValue(valuePartial: Partial<TValue>): Promise<void> {
        // TODO: Partial is working and I do not know why? Maybe Localstorage
        // this.urlsObserver.next(params as TValue);

        const params = {
            ...(this.lastValue as object),
            ...(valuePartial as object),
        } as TValue;

        const urlsObserver = await forValueDefined(() => this.urlsObserver);
        urlsObserver.next(params);
        const valuesObserver = await forValueDefined(() => this.valuesObserver);
        // TODO: Maybe this behaviour (putting into values values pushed by user) should be in the options
        valuesObserver.next(params);
    }

    public dispose() {
        /*  TODO: Implement */
    }

    protected abstract decodeUrl(url: string): Partial<TValue>;
    protected abstract encodeUrl(params: TValue, lastUrl: string): string;

    protected createUniqueIdentifier() {
        return createUniqueIdentifierFromParams(this.defaulTValue);
    }

    private async init() {
        // ------------- Observing the browser state
        this.values = Observable.create((valuesObserver: Observer<TValue>) => {
            this.valuesObserver = valuesObserver;

            window.addEventListener('popstate', (event) => {
                const paramsFromState = event.state as TValue & {
                    uniqueIdentifier: string;
                };
                if (
                    paramsFromState.uniqueIdentifier !== this.uniqueIdentifier
                ) {
                    return;
                }
                delete paramsFromState.uniqueIdentifier;
                this.lastValue = paramsFromState;
                valuesObserver.next(paramsFromState);
            });
        }).pipe(share()); // TODO: Maybe publish or none

        await forImmediate();

        // ------------- Pushing state to browser
        const urls: Observable<TValue> = Observable.create(
            (observer: Observer<TValue>) => {
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
            // console.log(`params`, params, this.lasTValue);

            if (isEqual(params, this.lastValue)) {
                // Preventing pushing same state twice
                return;
            }
            // console.log(`router PUSHING STATE`, params);

            this.lastValue = params;
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
        const urlParams = this.decodeUrl(window.location.toString()) as TValue;
        const storageParams =
            (await this.serializedStorage.getItem(this.uniqueIdentifier)) || {};

        const params: Partial<TValue> = {};
        for (const key of Object.keys(this.defaulTValue)) {
            (params as any)[key] =
                urlParams[key] || storageParams[key] || this.defaulTValue[key];
        }

        /*
        console.log('urlParams', urlParams);
        console.log('storageParams', storageParams);
        console.log('defaulTValue', defaulTValue);
        console.log('params', params);
        */

        this.lastValue = params as TValue;
        const valuesObserver = await forValueDefined(() => this.valuesObserver);
        // TODO: Maybe this behaviour (putting into values initial values) should be in the options
        valuesObserver.next(params as TValue);
        window.history.replaceState(
            { uniqueIdentifier: this.uniqueIdentifier, ...(params as {}) },
            window.document.title /* TODO: Is this a good solution? */,
            this.encodeUrl(params as TValue, window.location.toString()),
        );
    }
}
