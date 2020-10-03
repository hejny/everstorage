export interface IJson {
    [key: string]: string | number | null | undefined | IJson[] | IJson;
}
