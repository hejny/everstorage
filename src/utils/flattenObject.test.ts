import { flattenObject } from "./flattenObject";

describe('how converting flags to object works', () => {
    it('can keep flags object', () => {
        expect(flattenObject({ foo: true, bar: false })).toEqual({ isFoo: true, isBar: false });
    });

    it('can convert flags array to object', () => {
        expect(flagsToObject(['isFoo', 'isBar'])).toEqual({ isFoo: true, isBar: true });
    });

    it('can work with undefined', () => {
        expect(flagsToObject(undefined)).toEqual({});
    });
});
