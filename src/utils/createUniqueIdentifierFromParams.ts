import { ISerializable } from '../interfaces/ISerializable';

export function createUniqueIdentifierFromParams(
    params: ISerializable,
): string {
    const uniqueIdentifierParts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
        uniqueIdentifierParts.push(key);
        // Note: using only keys not type of values> uniqueIdentifierParts.push(typeof value);
    }
    return uniqueIdentifierParts.join('-');
}
