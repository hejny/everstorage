/* tslint:disable:no-empty */
import { IStorage } from '../interfaces/IStorage';

export class BlackholeStorage implements IStorage<any> {
    /**
     * Returns the number of key/value pairs currently present in the list associated with the object.
     */
    public get length(): number {
        return 0;
    }

    /**
     * Empties the list associated with the object of all key/value pairs, if there are any.
     */
    public clear(): void {}

    /**
     * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
     * @param key
     */
    public getItem(key: string): null {
        return null;
    }

    /**
     * Returns the name of the nth key in the list, or null if n is greater than or equal to the number of key/value pairs in the object.
     */
    public key(index: number): null {
        return null;
    }

    /**
     * Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
     */
    public removeItem(key: string): void {}

    /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     */
    public setItem(key: string, value: any): void {}
}

export const blackholeStorage = new BlackholeStorage();
