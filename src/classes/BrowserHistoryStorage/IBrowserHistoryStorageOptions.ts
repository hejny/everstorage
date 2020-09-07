export interface IBrowserHistoryStorageOptions {
    debounceInterval: number;
    preventDuplicates: boolean;
    saveToHistory: boolean;
    saveToStorage: boolean;
}

export const BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS: IBrowserHistoryStorageOptions = {
    debounceInterval: 0,
    preventDuplicates: true,
    saveToHistory: true,
    saveToStorage: true,
};
