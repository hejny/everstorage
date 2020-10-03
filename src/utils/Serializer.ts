import { ISerializable } from '../interfaces/ISerializable';
import { ISerialized } from '../interfaces/ISerialized';
import { ISerializeRule } from '../interfaces/ISerializeRule';

/**
 * Serializer can serialize/deserialize objects
 * TODO: Extending an instances of serializers. For example add new rules to basic serializer to cerate new one with default + new rules.
 * TODO: Use in Collboard as default Serializer
 */
export class Serializer<T extends ISerializable> {
    constructor(
        private rules: /* TODO: Should be named this param rules or serializeRules + Should it be in the constructor? */ Array<
            ISerializeRule<T>
        >,
    ) {}

    /**
     * TODO: Extending an instances of serializers. For example add new rules to basic serializer to cerate new one with default + new rules.
     */
    public addRule(rule: ISerializeRule<T>) {
        this.rules.push(rule);
    }

    public removeRule(rule: ISerializeRule<T>) {
        this.rules = this.rules.filter((rule2) => rule !== rule2);
        // TODO: Should be here checking if rule is existing?
    }

    public serialize(instance: null): null;
    public serialize(instance: T): ISerialized;
    public serialize(instance: null | T): null | ISerialized; // TODO !!!
    public serialize(instance: null | T): null | ISerialized {
        // TODO: Warn or error when object class is definitelly not generic Object but not defined in serializeRules

        if (instance === null) {
            return null;
        }

        const serializeRule = this.getSerializeRuleFromInstance(instance);
        // console.log({ instance, serializeRule });
        if (serializeRule) {
            if (serializeRule.serialize) {
                return serializeRule.serialize(instance);
            } else {
                // TODO: DRY
                const serializedData: ISerialized = {};
                serializedData.__class = serializeRule.name;
                for (const [key, value] of Object.entries(instance)) {
                    if (!key.startsWith('__')) {
                        serializedData[key] = this.serializeWithPrimitives(
                            value,
                        );
                    }
                }
                return serializedData;
            }
        } else {
            // TODO: DRY
            const serializedData: ISerialized = {};
            for (const [key, value] of Object.entries(instance)) {
                if (!key.startsWith('__')) {
                    serializedData[key] = this.serializeWithPrimitives(value);
                }
            }
            return serializedData;
        }
    }

    public deserialize(serialized: null): null;
    public deserialize(serialized: ISerialized): T;
    public deserialize(serialized: null | ISerialized): null | T;
    public deserialize(serialized: null | ISerialized): null | T {
        /* TODO: When deserializing make second param to check if object is really the requested type */

        if (serialized === null) {
            return null;
        }

        let instance: any;
        const serializeRule = this.getSerializeRuleFromSerialized(serialized);

        if (serializeRule) {
            /*
            TODO: Remove or get working
            if (serializeRule.migration) {
                serialized = serializeRule.migration(serialized) as any;
            }
            */
            if (serializeRule.deserialize) {
                instance = serializeRule.deserialize(serialized);
                return instance;
            } else if (serializeRule.class) {
                instance = new serializeRule.class();
            } else {
                throw new Error(
                    // TODO: Better error messages
                    `Deserialization: Can not construct because deserialize or class are missing in serialize rule.`,
                );
            }
        } else {
            instance = {};
        }

        for (const [key, value] of Object.entries(serialized)) {
            instance[key] = this.deserializeWithPrimitives(value);
        }

        return instance;
    }

    public deepClone<TCloned extends T>(instance: TCloned): TCloned {
        // TODO: Should there be JSON.parse(JSON.stringify( part?

        return this.deserialize(this.serialize(instance)) as TCloned;
    }

    private serializeWithPrimitives(value: any): any {
        // TODO: What about function?

        if (value === null || value === undefined) {
            return null;
        }

        // TODO: Why is not working: ['boolean', 'number', 'bigint', 'string', 'symbol'].includes[typeof value]
        if (
            typeof value === 'boolean' ||
            typeof value === 'number' ||
            typeof value === 'bigint' ||
            typeof value === 'string' ||
            typeof value === 'symbol'
        ) {
            return value;
        }

        if (typeof value === 'object' || typeof value === 'function') {
            if (Array.isArray(value)) {
                return value.map((value2) =>
                    this.serializeWithPrimitives(value2),
                );
            } else {
                return this.serialize(value);
            }
        }

        // console.log('value', value);
        // TODO: Better error messages
        throw new Error(
            `Serialization: Value have unexpected type "${typeof value}".`,
        );
    }

    private deserializeWithPrimitives(value: any): any {
        // TODO: What about function?

        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'string') {
            // TODO: DRY
            for (const serializeRule of this.rules) {
                if (
                    serializeRule.deserialize &&
                    serializeRule.checkSerialized &&
                    serializeRule.checkSerialized(value)
                ) {
                    return serializeRule.deserialize(value);
                }
            }
        }

        // TODO: Why is not working: ['boolean', 'number', 'bigint', 'string', 'symbol'].includes[typeof value]
        if (
            typeof value === 'boolean' ||
            typeof value === 'number' ||
            typeof value === 'bigint' ||
            typeof value === 'string' ||
            typeof value === 'symbol'
        ) {
            return value;
        }

        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return Promise.all(
                    value.map((value2) =>
                        this.deserializeWithPrimitives(value2),
                    ),
                );
            } else {
                return this.deserialize(value);
            }
        }

        // console.log('value', value);

        throw new Error(
            // TODO: Better error messages
            `Deserialization: Value have unexpected type "${typeof value}".`,
        );
    }

    private getSerializeRuleFromInstance(
        instance: any,
    ): ISerializeRule<T> | null {
        for (const serializeRule of this.rules) {
            if (
                serializeRule.checkInstance &&
                serializeRule.checkInstance(instance)
            ) {
                return serializeRule;
            }
        }

        // TODO: Maybe more optimal
        for (const serializeRule of this.rules) {
            if (
                serializeRule.class &&
                instance instanceof serializeRule.class
            ) {
                return serializeRule;
            }
        }

        return null;

        // console.log('instance', instance);
        // TODO: Better error messages
        // console.log({ instance });
        // throw new Error(`Deserialization: Can not serialize object.`);
    }

    private getSerializeRuleFromSerialized(
        serialized: ISerialized,
    ): ISerializeRule<T> | null {
        for (const serializeRule of this.rules) {
            if (
                serializeRule.checkSerialized &&
                serializeRule.checkSerialized(serialized)
            ) {
                return serializeRule;
            }
        }

        if (typeof serialized === 'string') {
            throw new Error(
                // TODO: Better error messages
                `Deserialization: Can not deserialize string because no rule passes the check of "${serialized}".`,
            );
        }

        if (!serialized.__class) {
            return null;
        }

        // TODO: Maybe more optimal
        for (const serializeRule of this.rules) {
            if (serialized.__class === serializeRule.name) {
                return serializeRule;
            }
        }

        throw new Error(
            // TODO: Better error messages
            `Deserialization: Can not deserialize object with class "${serialized.__class}".`,
        );
    }
}
