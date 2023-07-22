export interface IJson {
    [key: string]:
        | string
        | number
        | boolean
        | null
        | undefined
        | IJson[]
        | IJson;
}

// TODO: !!! Use here typefest
