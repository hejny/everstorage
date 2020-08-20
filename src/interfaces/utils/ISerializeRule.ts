import { Instantiable } from './Instantiable';
import { ISerialized } from './ISerialized';
/**
 * TODO: This is taken from CollBoard and should be reviewed
 */

export interface ISerializeRule<T> {
    name: string;
    class: Instantiable;
    factory?: (serialized: ISerialized) => T;
}
