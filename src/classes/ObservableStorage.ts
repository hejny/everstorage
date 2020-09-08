import { Observable, Observer } from 'rxjs';
import { share } from 'rxjs/operators';
import { forValueDefined } from 'waitasecond';

import { IObservableStorage } from '../interfaces/IObservableStorage';
import { IStorage } from '../interfaces/IStorage';
import { createUniqueIdentifierFromParams, IValue } from '../main';

/**
 * TODO: Maybe this is unsued due to option to setup a storages in AbstractBrowserHistoryStorage extended classes
 */
export abstract class ObservableStorage<TValue extends IValue>
    implements IObservableStorage<TValue> {
    public values: Observable<TValue>;
    private lastValue: TValue;
    private valuesObserver: Observer<TValue>;
    private uniqueIdentifier: string;

    constructor(
        readonly defaultValue: TValue,
        private serializedStorage: IStorage<TValue>,
    ) {
        this.init();
    }

    public get value(): TValue {
        return this.lastValue;
    }

    public async pushValue(partialValue: Partial<TValue>): Promise<void> {
        // TODO: Partial is working and I do not know why? Maybe Localstorage
        // this.urlsObserver.next(params as TValue );

        const params = {
            ...(this.lastValue as object),
            ...(partialValue as object),
        } as TValue;

        // TODO: Remove const valuesObserver = await forValueDefined(() => this.valuesObserver);
        // TODO: Maybe this behaviour (putting into values values pushed by user) should be in the options
        this.valuesObserver.next(params);

        this.serializedStorage.setItem(this.uniqueIdentifier, params);
    }

    public dispose() {
        /*  TODO: Implement */
    }

    protected createUniqueIdentifier() {
        return createUniqueIdentifierFromParams(this.defaultValue);
    }

    private async init() {
        this.uniqueIdentifier = this.createUniqueIdentifier();

        // ------------- Observing the browser state
        this.values = Observable.create((observer: Observer<TValue>) => {
            this.valuesObserver = observer;
        }).pipe(share()); // TODO: Maybe publish or none

        // TODO: Remove await forImmediate();
        this.loadInitialParams();
    }

    private async loadInitialParams() {
        const storageParams =
            (await this.serializedStorage.getItem(this.uniqueIdentifier)) || {};

        const params: Partial<TValue> = {};
        for (const key of Object.keys(this.defaultValue)) {
            (params as any)[key] = storageParams[key] || this.defaultValue[key];
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
    }
}
