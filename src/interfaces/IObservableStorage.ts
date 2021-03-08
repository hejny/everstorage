import { Observable } from 'rxjs';
import { IDestroyable } from './IDestroyable';
import { ISerializable } from './ISerializable';

/** This is simmilar to Web Storage API interface but values are observable streams. */
export interface IObservableStorage<TValue extends ISerializable>
    extends IDestroyable {
    value: TValue;
    values: Observable<TValue>;
    pushValue(value: TValue): void;
}
