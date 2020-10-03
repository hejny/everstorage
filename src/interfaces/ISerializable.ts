import { IInstantiable } from './IInstantiable';

// TODO: This may be generically typed with deserialized type for example ISerialized<Vector>
export type ISerializable = ISerializableCore|object;

export interface ISerializableCore {
    [key: string]:
        | string
        | number
        | null
        | undefined
        | object
        | ISerializable[]
        | ISerializable;
}


/*/
// Note: Keeping for testing purposes:

function test<T extends ISerializable>(serializable: T):T{
    return serializable;
}

test({x:10,y:10};
// test(new Date());
test({date:new Date()});


/**/