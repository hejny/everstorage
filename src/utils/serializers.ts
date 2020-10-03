import { ISerializable } from '../interfaces/ISerializable';
import { Serializer } from './Serializer';

/**
 * Basic serializer without any registered Classes
 * Note: Always allow user to pick Serializer. This will be used as the default;
 */

export const serializer = new Serializer([]);

/**
 * TODO: Extend from serializer
 * TODO: It is actually not extended but only extended by Date
 */
export const serializerWithDate = new Serializer<ISerializable>([
    {
        name: 'Date',
        checkInstance: (instance: any) =>
            typeof instance.getMonth === 'function',
        serialize: (date: any) => date.toISOString(),
        // TODO:  !!! serialize/deserialize
        // factory: (serialized: ISerialized) => T;
    },
]);
