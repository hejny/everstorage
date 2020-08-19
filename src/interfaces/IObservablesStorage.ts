import { Observable } from 'rxjs';

export type IParams = Record<string, string | number | null | undefined>;

/** This is simmilar to Web Storage API interface but values are observable streams. */
export interface IObservablesStorage<TParams extends IParams> {
    values: Observable<TParams>;
    pushValues(values: TParams): void;
    dispose(): void;
}
