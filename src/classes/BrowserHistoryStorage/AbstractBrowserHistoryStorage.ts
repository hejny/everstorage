import { interval, Observable, Observer } from 'rxjs';
import { debounce, share } from 'rxjs/operators';
import { forImmediate, forValueDefined } from 'waitasecond';

import {
    IObservableStorage,
    IValue,
} from '../../interfaces/IObservableStorage';
import { IStorage } from '../../interfaces/IStorage';
import { createUniqueIdentifierFromParams } from '../../utils/createUniqueIdentifierFromParams';
import {
    BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS,
    IBrowserHistoryStorageOptions,
} from './IBrowserHistoryStorageOptions';

export abstract class AbstractBrowserHistoryStorage<TValue extends IValue>
    implements IObservableStorage<TValue> {
    public values: Observable<TValue>;
    private lastValue: TValue;
    private valuesToSaveObserver?: Observer<TValue>;
    private valuesObserver?: Observer<TValue>;
    private options: IBrowserHistoryStorageOptions;
    private uniqueIdentifier: string;
    // private pushValueLock: boolean = false /* TODO: Put locking and queues into waitasecond */;

    constructor(
        readonly defaultValue: TValue,
        partialOptions?: Partial<IBrowserHistoryStorageOptions>,
        private serializedStorage?: IStorage<TValue>,
    ) {
        // TODO: Check collisions globally

        this.options = {
            ...BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS,
            ...partialOptions,
        };

        if (this.options.saveToStorage && !serializedStorage) {
            throw new Error(
                `When you want to save to storage you need to provide one.`,
            );
        }

        this.init();
    }

    public get value(): TValue {
        return this.lastValue;
    }

    public async pushValue(partialValue: Partial<TValue>): Promise<void> {
        /*await forValueDefined(() =>
            this.pushValueLock ? console.log(`Waiting for lock`) : true,
        );
        this.pushValueLock = true;*/

        if (this.options.preventDuplicates) {
            let changed = false;
            for (const [key, value] of Object.entries(partialValue)) {
                // console.log(this.lastValue[key], value);
                if (this.lastValue[key] !== value) {
                    changed = true;
                }
            }
            if (!changed) {
                //this.pushValueLock = false;
                return;
            }
        }
        const value = {
            ...(this.lastValue as object),
            ...(partialValue as object),
        } as TValue;

        this.lastValue = value;

        const valuesToSaveObserver = await forValueDefined(
            () => this.valuesToSaveObserver,
        );
        valuesToSaveObserver.next(value);

        const valuesObserver = await forValueDefined(() => this.valuesObserver);
        // TODO: Maybe this behaviour (putting into values values pushed by user) should be in the options
        valuesObserver.next(value);

        //this.pushValueLock = false;
    }

    public dispose() {
        /*  TODO: Implement */
    }

    protected abstract decodeUrl(url: string): Partial<TValue>;
    protected abstract encodeUrl(params: TValue, lastUrl: string): string;

    protected createUniqueIdentifier() {
        return createUniqueIdentifierFromParams(this.defaultValue);
    }

    private async init() {
        this.uniqueIdentifier = this.createUniqueIdentifier();

        // ------------- Observing the browser state
        this.values = Observable.create((valuesObserver: Observer<TValue>) => {
            this.valuesObserver = valuesObserver;

            if (this.options.saveToHistory) {
                window.addEventListener('popstate', (event) => {
                    // console.log('popstate');
                    const paramsFromState = event.state as TValue & {
                        uniqueIdentifier: string;
                    };
                    if (
                        paramsFromState.uniqueIdentifier !==
                        this.uniqueIdentifier
                    ) {
                        return;
                    }
                    delete paramsFromState.uniqueIdentifier;
                    this.lastValue = paramsFromState;
                    valuesObserver.next(paramsFromState);
                });
            }
        }).pipe(share()); // TODO: Maybe publish or none

        await forImmediate();

        // ------------- Pushing state to browser

        const valuesToSave: Observable<TValue> = Observable.create(
            (observer: Observer<TValue>) => {
                this.valuesToSaveObserver = observer;
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

        valuesToSave.subscribe((paramsToUrl) => {
            // console.log(`router PUSHING STATE`, params);

            if (this.options.saveToHistory) {
                window.history.pushState(
                    {
                        uniqueIdentifier: this.uniqueIdentifier,
                        ...(paramsToUrl as {}),
                    },
                    window.document.title /* TODO: Is this a good solution? */,
                    this.encodeUrl(paramsToUrl, window.location.toString()),
                );
            }

            if (this.options.saveToStorage) {
                this.serializedStorage!.setItem(
                    this.uniqueIdentifier,
                    paramsToUrl,
                );
            }
        });

        // -------------Load initial params

        const urlParams: Partial<TValue> = !this.options.saveToHistory
            ? {}
            : this.decodeUrl(window.location.toString());

        const storageParams: Partial<TValue> = !this.options.saveToStorage
            ? {}
            : (this.options.saveToStorage &&
                  (await this.serializedStorage!.getItem(
                      this.uniqueIdentifier,
                  ))) ||
              {};

        const params: Partial<TValue> = {};
        for (const key of Object.keys(this.defaultValue)) {
            (params as any)[key] =
                urlParams[key] || storageParams[key] || this.defaultValue[key];
        }

        /*
        console.log('urlParams', urlParams);
        console.log('storageParams', storageParams);
        console.log('defaultValue', defaultValue);
        console.log('params', params);
        */

        this.lastValue = params as TValue;
        const valuesObserver = await forValueDefined(() => this.valuesObserver);
        // TODO: Maybe this behaviour (putting into values initial values) should be in the options
        valuesObserver.next(params as TValue);
        if (this.options.saveToHistory) {
            window.history.replaceState(
                { uniqueIdentifier: this.uniqueIdentifier, ...(params as {}) },
                window.document.title /* TODO: Is this a good solution? */,
                this.encodeUrl(params as TValue, window.location.toString()),
            );
        }
    }
}
