// TODO: DRY
export type ISerialized = ISerializedObject | ISerialized[] | string | number | null | undefined;

// TODO: This may be generically typed with deserialized type for example ISerialized<Vector>
interface ISerializedObject /* extends IJson*/ {
    __class?: string;
    [key: string]:
        | string
        | number
        | null
        | undefined
        | ISerialized[]
        | ISerialized;
}
