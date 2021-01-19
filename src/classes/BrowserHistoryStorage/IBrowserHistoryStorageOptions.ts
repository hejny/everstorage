export interface IBrowserHistoryStorageOptions {
    initialize: boolean;
    uniqueIdentifier: null | string /* TODO: Here maybe should not be null */;
    debounceInterval: number;
    preventDuplicates: boolean;
    saveToHistory: boolean;
    saveToStorage: boolean;
}

export const BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS: IBrowserHistoryStorageOptions = {
    initialize: true,
    uniqueIdentifier: null,
    debounceInterval: 0,
    preventDuplicates: true,
    saveToHistory: true,
    saveToStorage: true,
};
