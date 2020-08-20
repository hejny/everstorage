// TODO: This may be generically typed with deserialized type for example ISerialized<Vector>
export type ISerialized = Record<string, any> & {
    __class?: string;
};
