import { BehaviorSubject, interval, Subject } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { forImmediate } from 'waitasecond';
import { createEmptyValue } from '../../interfaces/createEmptyValue';
import { IBrowserState } from '../../interfaces/IBrowserState';
import { IDestroyable } from '../../interfaces/IDestroyable';
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

export abstract class AbstractBrowserHistoryStorage<
    TValue extends ISerializable
> implements IObservableStorage<TValue>, IDestroyable {
    public destroyed = false;
    public values: BehaviorSubject<TValue>;
    private valuesToSave: Subject<TValue>;
    private options: IBrowserHistoryStorageOptions;
    private uniqueIdentifier: string;
    private storage?: IStorage<TValue>;
    private initialized: boolean = false;
    // private pushValueLock: boolean = false /* TODO: Put locking and queues into waitasecond */;

    /**
     * This is saved to be able to destoroy
     */
    private popstateEventListener: (event: PopStateEvent) => void;

    constructor(
        readonly defaultValue: TValue,
        options?: Partial<IBrowserHistoryStorageOptions>,
        private baseStorage?: IStorage<ISerialized>,
        protected serializer: Serializer<TValue> = (serializerWithDate as unknown) as Serializer<TValue>,
    ) {
        // TODO: Check collisions globally

        this.options = {
            ...BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS,
            ...options,
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
        return this.values.getValue();
    }

    public set value(value: TValue) {
        this.setValue(value);
    }

    public setValue(partialValue: Partial<TValue>) {
        /*await forValueDefined(() =>
            this.pushValueLock ? console.log(`Waiting for lock`) : true,
        );
        this.pushValueLock = true;*/

        if (this.options.preventDuplicates) {
            let changed = false;
            const lastValue = this.values.getValue();
            /* tslint:disable:no-shadowed-variable */
            for (const [key, value] of Object.entries(partialValue)) {
                // console.log(this.lastValue[key], value);
                if (lastValue[key] !== value) {
                    changed = true;
                }
            }
            if (!changed) {
                // this.pushValueLock = false;
                return;
            }
        }
        const value = {
            ...(this.values.getValue() as object),
            ...(partialValue as object),
        } as TValue;

        this.valuesToSave.next(value);

        // TODO: Maybe this behaviour (putting into values values pushed by user) should be in the options
        this.values.next(value);

        // this.pushValueLock = false;
    }

    public destroy() {
        this.destroyed = true;
        if (this.options.saveToHistory) {
            window.history.pushState(
                null,
                window.document.title,
                this.encodeUrl(
                    createEmptyValue(this.defaultValue) as any,
                    new URL(window.location.toString()),
                ).toString(),
            );

            window.removeEventListener('popstate', this.popstateEventListener);
        }

        this.valuesToSave.complete();
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
            this.baseStorage || (objectLocalStorage as IStorage<ISerialized>),
            //    this.uniqueIdentifier,
            // ),
            this.serializer,
        );

        // ------------- Observing the browser state
        this.values = new BehaviorSubject(this.defaultValue);

        if (this.options.saveToHistory) {
            this.popstateEventListener = (event: PopStateEvent) => {
                const state = event.state;
                // console.log('popstate', { state });

                if (!state) {
                    return;
                }
                if (typeof state !== 'object') {
                    return;
                }
                if (state.uniqueIdentifier !== this.uniqueIdentifier) {
                    return;
                }

                const value = this.serializer.deserialize(state.data)!;

                // console.log('popstate/next', { value });
                this.values.next((value as IBrowserState) as TValue);
            };
            window.addEventListener('popstate', this.popstateEventListener);
        }

        await forImmediate();

        // ------------- Pushing state to browser

        this.valuesToSave = new Subject();

        this.valuesToSave
            .pipe(
                debounce(() =>
                    interval(
                        // TODO: Maybe when there is debounceInterval=0 there should be no pipe with debounce+interval
                        //  TODO: Is there some better solution then debouncing with interval?
                        this.options.debounceInterval,
                    ),
                ),
            )
            .subscribe((paramsToUrl) => {
                // console.log(`router PUSHING STATE`, params);

                if (this.options.saveToHistory) {
                    window.history.pushState(
                        {
                            uniqueIdentifier: this.uniqueIdentifier,
                            data: this.serializer.serialize(paramsToUrl),
                        } as IBrowserState,
                        window.document
                            .title /* TODO: Is this a good solution? */,
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
        for (const key of Object.keys(this.defaultValue)) {
            (params as any)[key] =
                urlParams[key] || storageParams[key] || this.defaultValue[key];
        }

        // TODO: !!! Serializer

        /*
        console.log('urlParams', urlParams);
        console.log('storageParams', storageParams);
        console.log('defaultValue', defaultValue);
        console.log('params', params);
        */

        // TODO: Maybe this behaviour (putting into values initial values) should be in the options
        this.values.next(params as TValue);
        if (this.options.saveToHistory) {
            window.history.replaceState(
                {
                    uniqueIdentifier: this.uniqueIdentifier,
                    data: this.serializer.serialize(params as TValue),
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
        return createUniqueIdentifierFromParams(this.defaultValue);
    }
}
