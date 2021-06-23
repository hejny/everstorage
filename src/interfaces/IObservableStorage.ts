import { IDestroyable } from 'destroyable';
import { BehaviorSubject } from 'rxjs';
import { ISerializable } from './ISerializable';

/** This is simmilar to Web Storage API interface but values are observable streams. */
export interface IObservableStorage<TValue extends ISerializable>
    extends IDestroyable {
    /**
     * Just a shorthand to get/set last/next value in values
     */
    value: TValue;

    /**
     * Set values through value not value.next() (TODO: Maybe change?)
     */
    values: Omit<BehaviorSubject<TValue>, 'next'>;

    /**
     * If you want a set a value only partially
     */
    setValue(value: Partial<TValue>): void;
}
