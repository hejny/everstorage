import { IStorage } from '../interfaces/IStorage';
import { Awaitable } from '../interfaces/utils/Awaitable';

/**
 * This class behaves like LocalStorage but separates keys by prefix
 */
export class PrefixStorage<T> implements IStorage<T> {
    constructor(
        private baseStorage: IStorage<T>,
        private keyPrefix: string,
        private separator: string = '_',
    ) {}

    /**
     * Returns the number of key/value pairs currently present in the list associated with the object.
     */
    public get length(): Awaitable<number> {
        return this.baseStorage.length /* TODO: Real count */;
    }

    /**
     * Empties the list associated with the object of all key/value pairs, if there are any.
     */
    public clear(): void {
        // TODO: Implement
    }

    /**
     * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
     */
    public getItem(key: string): Awaitable<T | null> {
        return this.baseStorage.getItem(this.keyPrefix + this.separator + key);
    }

    /**
     * Returns the name of the nth key in the list, or null if n is greater than or equal to the number of key/value pairs in the object.
     */
    public key(index: number): string | null {
        // TODO: Implement
        return null;
    }

    /**
     * Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
     */
    public removeItem(key: string): void {
        this.baseStorage.removeItem(this.keyPrefix + this.separator + key);
    }

    /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     */
    public setItem(key: string, value: T): Awaitable<void> {
        return this.baseStorage.setItem(
            this.keyPrefix + this.separator + key,
            value,
        );
    }
}
