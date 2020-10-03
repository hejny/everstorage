import { IAwaitable } from './IAwaitable';

/** This is same as Web Storage API interface but everything is asynchronous. */
export interface IStorage<T> {
    /**
     * Returns the number of key/value pairs currently present in the list associated with the object.
     */
    readonly length: IAwaitable<number>;
    /**
     * Empties the list associated with the object of all key/value pairs, if there are any.
     */
    clear(): IAwaitable<void>;
    /**
     * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
     */
    getItem(key: string): IAwaitable<T | null>;
    /**
     * Returns the name of the nth key in the list, or null if n is greater than or equal to the number of key/value pairs in the object.
     */
    key(index: number): IAwaitable<string | null>;
    /**
     * Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
     */
    removeItem(key: string): IAwaitable<void>;
    /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     *
     * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
     */
    setItem(key: string, value: T): IAwaitable<void>;
}

/* tslint:disable:jsdoc-format */
/*/
if (false) {
    // Note: Just checking if localStorage and sessionStorage are implementing IStorage<string>
    let storage: IStorage<string>;
    storage = localStorage;
    storage = sessionStorage;
}
/**/
