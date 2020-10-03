import { Observable } from 'rxjs';

import { ISerializable } from './ISerializable';

/** This is simmilar to Web Storage API interface but values are observable streams. */
export interface IObservableStorage<TValue extends ISerializable> {
    value: TValue;
    values: Observable<TValue>;
    pushValue(value: TValue): void;
    dispose(): void;
}
