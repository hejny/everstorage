// TODO: Still unused - Use (create SerializedStorage<T> using ObjectStorage ) or remove
// /**
//  * Serializer can serialize/deserialize objects
//  */
// export class Serializer<T> {
//     constructor(
//         private rules: /* TODO: Should be named this param rules or serializeRules + Should it be in the constructor? */ ISerializeRule<
//             T
//         >[],
//     ) {}

//     public addRule(rule: ISerializeRule<T>) {
//         this.rules.push(rule);
//     }

//     public removeRule(rule: ISerializeRule<T>) {
//         this.rules = this.rules.filter((rule_) => rule !== rule_);
//         // TODO: Should be here checking if rule is existing?
//     }

//     public serialize(instance: T): ISerialized {
//         // TODO: Warn or error when object class is definitelly not generic Object but not defined in serializeRules

//         const serializedData: ISerialized = {};

//         const serializeRule = this.getSerializeRuleFromInstance(instance);
//         if (serializeRule) {
//             serializedData.__class = serializeRule.name;
//         }

//         for (const [key, value] of Object.entries(instance)) {
//             if (!key.startsWith('__')) {
//                 serializedData[key] = this.serializeWithPrimitives(value);
//             }
//         }

//         return serializedData;
//     }

//     public deserialize(serialized: ISerialized): T {
//         /* TODO: When deserializing make second param to check if object is really the requested type */

//         let instance: any;
//         const serializeRule = this.getSerializeRuleFromSerialized(serialized);

//         if (serializeRule) {
//             /*
//             TODO: Remove or get working
//             if (serializeRule.migration) {
//                 serialized = serializeRule.migration(serialized) as any;
//             }
//             */
//             if (serializeRule.factory) {
//                 instance = serializeRule.factory(serialized);
//                 return instance;
//             } else {
//                 instance = new serializeRule.class();
//             }
//         } else {
//             instance = {};
//         }

//         for (const [key, value] of Object.entries(serialized)) {
//             instance[key] = this.deserializeWithPrimitives(value);
//         }

//         return instance;
//     }

//     private serializeWithPrimitives(value: any): any {
//         // TODO: What about function?

//         if (typeof value === 'undefined' || isNull(value)) {
//             return null;
//         }

//         // TODO: Why is not working: ['boolean', 'number', 'bigint', 'string', 'symbol'].includes[typeof value]
//         if (
//             typeof value === 'boolean' ||
//             typeof value === 'number' ||
//             typeof value === 'bigint' ||
//             typeof value === 'string' ||
//             typeof value === 'symbol'
//         ) {
//             return value;
//         }

//         if (typeof value === 'object') {
//             if (Array.isArray(value)) {
//                 return value.map((value) => this.serializeWithPrimitives(value));
//             } else {
//                 return this.serialize(value);
//             }
//         }

//         console.log('value', value);
//         // TODO: Some better error message
//         throw new Error(`Serialization: Value have unexpected type "${typeof value}".`);
//     }

//     private deserializeWithPrimitives(value: any): any {
//         // TODO: What about function?

//         if (typeof value === 'undefined' || isNull(value)) {
//             return null;
//         }

//         // TODO: Why is not working: ['boolean', 'number', 'bigint', 'string', 'symbol'].includes[typeof value]
//         if (
//             typeof value === 'boolean' ||
//             typeof value === 'number' ||
//             typeof value === 'bigint' ||
//             typeof value === 'string' ||
//             typeof value === 'symbol'
//         ) {
//             return value;
//         }

//         if (typeof value === 'object') {
//             if (Array.isArray(value)) {
//                 return Promise.all(value.map((value) => this.deserializeWithPrimitives(value)));
//             } else {
//                 return this.deserialize(value);
//             }
//         }

//         console.log('value', value);
//         // TODO: Some better error message
//         throw new Error(`Deserialization: Value have unexpected type "${typeof value}".`);
//     }

//     private getSerializeRuleFromInstance(instance: any): ISerializeRule<T> | null {
//         // TODO: Maybe more optimal
//         for (const serializeRule of this.rules) {
//             if (instance instanceof serializeRule.class) {
//                 return serializeRule;
//             }
//         }

//         console.log('instance', instance);
//         throw new Error(`Deserialization: Can not serialize object.`);
//     }

//     private getSerializeRuleFromSerialized(serialized: ISerialized): ISerializeRule<T> | null {
//         if (!serialized.__class) {
//             return null;
//         }

//         // TODO: Maybe more optimal
//         for (const serializeRule of this.rules) {
//             if (serialized.__class === serializeRule.name) {
//                 return serializeRule;
//             }
//         }

//         throw new Error(`Deserialization: Can not deserialize object with class "${serialized.__class}".`);
//     }

//     public deepClone<TCloned extends T>(instance: TCloned): TCloned {
//         // TODO: Should there be JSON.parse(JSON.stringify( part?

//         return this.deserialize(this.serialize(instance)) as TCloned;
//     }
// }

// /**
//  * Basic serializer without any registered Classes
//  */
// export const serializer = new Serializer([]);
