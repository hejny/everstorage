import { Observable } from 'rxjs';
import { IDestroyable } from './IDestroyable';
import { ISerializable } from './ISerializable';

/** This is simmilar to Web Storage API interface but values are observable streams. */
/* TODO: !!! Change it entirelly to BehaviorSubject and  maybe completelly remove IDestroyable */
export interface IObservableStorage<TValue extends ISerializable>
    extends IDestroyable {
    value: TValue;
    values: Observable<TValue>;
    pushValue(value: TValue): void;
}
