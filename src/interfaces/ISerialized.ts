export type ISerialized = ISerializedObject | string;

// TODO: Split into multiple exported interfaces

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
