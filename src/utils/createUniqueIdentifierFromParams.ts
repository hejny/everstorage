import { IValue } from '../interfaces/IObservableStorage';

export function createUniqueIdentifierFromParams(params: IValue): string {
    const uniqueIdentifierParts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
        uniqueIdentifierParts.push(key);
        uniqueIdentifierParts.push(typeof value);
    }
    return uniqueIdentifierParts.join('-');
}
