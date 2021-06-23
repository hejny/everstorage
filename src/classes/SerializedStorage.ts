import { IAwaitable } from 'destroyable';
import { ISerializable } from '../interfaces/ISerializable';
import { ISerialized } from '../interfaces/ISerialized';
import { IStorage } from '../interfaces/IStorage';
import { Serializer } from '../utils/Serializer';

/**
 * This class behaves like LocalStorage but entries are objects
 * TODO: This is taken from CollBoard and should be reviewed
 */
export class SerializedStorage<T extends ISerializable> {
    constructor(
        private baseStorage: IStorage<ISerialized>,
        private serializer: Serializer<T>,
    ) {}

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
        return this.serializer.deserialize(
            (await this.baseStorage.getItem(key)) as ISerialized,
        );
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
        return this.baseStorage.setItem(key, this.serializer.serialize(value));
    }
}
