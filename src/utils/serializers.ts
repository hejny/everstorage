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
        checkSerialized: (data: any) =>
            // @see https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
            /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/.test(
                data,
            ),
        serialize: (date: any) => date.toISOString(),
        deserialize: (datestring: any) =>
            (new Date(datestring) as any) as ISerializable,
    },
]);
