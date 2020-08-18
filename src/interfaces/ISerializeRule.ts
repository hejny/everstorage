import { IInstantiable } from '../interfaces/IInstantiable';
import { ISerialized } from "./ISerialized";
/**
 * TODO: This is taken from CollBoard and should be reviewed
 */

export interface ISerializeRule<T> {
    name: string;
    class: IInstantiable;
    factory?: (serialized: ISerialized) => T;
}
