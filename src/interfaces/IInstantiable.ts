export type IInstantiable = new (...args: any[]) => any;

/*/
// Note: Keeping for testing purposes:

function test<T extends IInstantiable>(serializable: T):T{
    return serializable;
}

test(Date);


/**/
