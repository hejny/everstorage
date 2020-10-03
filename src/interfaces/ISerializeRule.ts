import { IInstantiable } from './IInstantiable';
import { ISerializable } from './ISerializable';
import { ISerialized } from './ISerialized';
/**
 * TODO: This is taken from CollBoard and should be reviewed
 */

export interface ISerializeRule<T extends ISerializable> {
    name?: string;
    class?: IInstantiable;
    checkInstance?: (instance: T) => boolean;
    checkSerialized?: (serialized: ISerialized) => boolean;
    // TODO: pattern?: RegExp;
    serialize?: (instance: T) => ISerialized;
    deserialize?: (serialized: ISerialized) => T;
}

// Note: When checkSerialized is working with string there must be defined deserialize. TODO: Interface union
// TODO: Split into multiple exported interfaces
