import { IAwaitable } from 'destroyable';
import { IJson } from '../interfaces/IJson';
import { IStorage } from '../interfaces/IStorage';

/**
 * This class behaves like LocalStorage but entries are JSON objects
 */
export class ObjectStorage<T extends IJson> {
    constructor(private baseStorage: IStorage<string>) {}

    /**
     * Returns the number of key/value pairs currently present in the list associated with the object.
     */
    public get length(): IAwaitable<number> {
        return this.baseStorage.length;
    }

    /**
     * Empties the list associated with the object of all key/value pairs, if there are any.
     */
    public clear(): void {
        this.baseStorage.clear();
    }

    /**
     * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
     */
    public async getItem(key: string): Promise<T | null> {
        const serializedString = await this.baseStorage.getItem(key);
        if (!serializedString) {
            return null;
        }
        const object = JSON.parse(serializedString);

        return object;
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
        this.baseStorage.removeItem(key);
    }

    /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     */
    public setItem(key: string, value: T): IAwaitable<void> {
        return this.baseStorage.setItem(key, JSON.stringify(value));
    }
}

export const objectLocalStorage = new ObjectStorage(localStorage);
