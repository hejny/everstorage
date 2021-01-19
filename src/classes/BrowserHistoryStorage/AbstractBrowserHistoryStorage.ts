import { interval, Observable, Observer } from 'rxjs';
import { debounce, share } from 'rxjs/operators';
import { forImmediate, forValueDefined } from 'waitasecond';

import { IBrowserState } from '../../interfaces/IBrowserState';
import { IObservableStorage } from '../../interfaces/IObservableStorage';
import { ISerializable } from '../../interfaces/ISerializable';
import { ISerialized } from '../../interfaces/ISerialized';
import { IStorage } from '../../interfaces/IStorage';
import { createUniqueIdentifierFromParams } from '../../utils/createUniqueIdentifierFromParams';
import { Serializer } from '../../utils/Serializer';
import { serializerWithDate } from '../../utils/serializers';
import { objectLocalStorage } from '../ObjectStorage';
import { SerializedStorage } from '../SerializedStorage';
import {
    BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS,
    IBrowserHistoryStorageOptions,
} from './IBrowserHistoryStorageOptions';

export interface IAbstractBrowserHistoryStorageOptions<
    TValue extends ISerializable
> extends Partial<IBrowserHistoryStorageOptions> {
    defaultValue: TValue;
    baseStorage?: IStorage<ISerialized>;
    serializer?: Serializer<TValue>;
}

export abstract class AbstractBrowserHistoryStorage<
    TValue extends ISerializable
> implements IObservableStorage<TValue> {
    public values: Observable<TValue>;
    protected options: Required<IAbstractBrowserHistoryStorageOptions<TValue>>;
    private lastValue: TValue;
    private valuesToSaveObserver?: Observer<TValue>;
    private valuesObserver?: Observer<TValue>;
    private uniqueIdentifier: string;
    private storage?: IStorage<TValue>;
    private initialized: boolean = false;
    // private pushValueLock: boolean = false /* TODO: Put locking and queues into waitasecond */;

    constructor(options: IAbstractBrowserHistoryStorageOptions<TValue>) {
        // TODO: Check collisions globally

        if (options.serializer) {
            options.serializer = (serializerWithDate as unknown) as Serializer<
                TValue
            >;
        }

        this.options = {
            ...BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS,
            ...options,
            /* TODO: Bit inefficient */
            // serializer: (serializerWithDate as unknown) as Serializer<TValue>,
        };

        /*
        if (this.options.saveToStorage && !storage) {
            // TODO: Better error messages
            throw new Error(
                `When you want to save to storage you need to provide it.`,
            );
        }
        */

        if (this.options.initialize) {
            this.initialize();
        }
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
            /* tslint:disable:no-shadowed-variable */
            for (const [key, value] of Object.entries(partialValue)) {
                // console.log(this.lastValue[key], value);
                if (this.lastValue[key] !== value) {
                    changed = true;
                }
            }
            if (!changed) {
                // this.pushValueLock = false;
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

        // this.pushValueLock = false;
    }

    public dispose() {
        /*  TODO: Implement */
    }

    public createLink(value: TValue, baseUrl?: URL | string): URL {
        if (!baseUrl) {
            baseUrl = window.location.toString();
        }

        return this.encodeUrl(
            value,
            typeof baseUrl === 'string' ? new URL(baseUrl) : baseUrl,
        );
    }

    public async initialize() {
        // ------------- Check if initialized and prevent multiple initializations

        if (this.initialized) {
            throw new Error(`Browser history storage was alread initialized.`);
        }

        this.initialized = true;

        // ------------- Create a uniqueIdentifier

        this.uniqueIdentifier =
            this.options.uniqueIdentifier || this.createUniqueIdentifier();

        // ------------- Create a storage

        this.storage = new SerializedStorage(
            // new PrefixStorage(
            this.options.baseStorage ||
                (objectLocalStorage as IStorage<ISerialized>),
            //    this.uniqueIdentifier,
            // ),
            this.options.serializer,
        );

        // ------------- Observing the browser state
        this.values = new Observable((observer: Observer<TValue>) => {
            this.valuesObserver = observer;

            if (this.options.saveToHistory) {
                window.addEventListener('popstate', (event) => {
                    // console.log('popstate');
                    const state = event.state as IBrowserState;
                    if (state.uniqueIdentifier !== this.uniqueIdentifier) {
                        return;
                    }

                    const value = this.options.serializer.deserialize(
                        state.data,
                    );

                    this.lastValue = value;
                    observer.next(value);
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
                        data: this.options.serializer.serialize(paramsToUrl),
                    } as IBrowserState,
                    window.document.title /* TODO: Is this a good solution? */,
                    this.encodeUrl(
                        paramsToUrl,
                        new URL(window.location.toString()),
                    ).toString(),
                );
            }

            if (this.options.saveToStorage) {
                this.storage!.setItem(this.uniqueIdentifier, paramsToUrl);
            }
        });

        // -------------Load initial params

        const urlParams: Partial<TValue> = !this.options.saveToHistory
            ? {}
            : this.decodeUrl(new URL(window.location.toString()));

        const storageParams: Partial<TValue> = !this.options.saveToStorage
            ? {}
            : (this.options.saveToStorage &&
                  (await this.storage!.getItem(this.uniqueIdentifier))) ||
              {};

        const params: Partial<TValue> = {};
        for (const key of Object.keys(this.options.defaultValue)) {
            (params as any)[key] =
                urlParams[key] ||
                storageParams[key] ||
                this.options.defaultValue[key];
        }

        // TODO: !!! Serializer

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
                {
                    uniqueIdentifier: this.uniqueIdentifier,
                    data: this.options.serializer.serialize(params as TValue),
                } as IBrowserState,
                window.document.title /* TODO: Is this a good solution? */,
                this.encodeUrl(
                    params as TValue,
                    new URL(window.location.toString()),
                ).toString(),
            );
        }
    }

    protected abstract decodeUrl(url: URL): Partial<TValue>;
    protected abstract encodeUrl(params: TValue, lastUrl: URL): URL;

    protected createUniqueIdentifier() {
        return createUniqueIdentifierFromParams(this.options.defaultValue);
    }
}
