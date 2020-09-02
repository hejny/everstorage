import { Observable } from 'rxjs';

export type IValue = Record<string, string | number | null | undefined>;

/** This is simmilar to Web Storage API interface but values are observable streams. */
export interface IObservableStorage<TValue extends IValue> {
    values: Observable<TValue>;
    pushValue(value: TValue): void;
    dispose(): void;
}
