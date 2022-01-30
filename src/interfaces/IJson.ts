export interface IJson {
    [key: string]: string | number | null | undefined | IJson[] | IJson;
}

// TODO: !!! Use here typefest
