export function createEmptyValue<T>(value: T): Record<keyof T, null> {
    const emptyValue: any = {};

    for (const key of Object.keys(value)) {
        emptyValue[key] = null;
    }

    return emptyValue;
}
