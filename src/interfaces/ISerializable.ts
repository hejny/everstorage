import { IInstantiable } from './IInstantiable';

// TODO: This may be generically typed with deserialized type for example ISerialized<Vector>
export interface ISerializable extends Partial<IInstantiable> {
    [key: string]:
        | string
        | number
        | null
        | undefined
        | IInstantiable
        | ISerializable[]
        | ISerializable;
}
