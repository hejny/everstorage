/*
import { Vector } from '../src/Vector';

describe('Vector2', () => {
    // ______________[ Setup ]

    const point0x0y = new Vector(0, 0);
    const point1x1y = new Vector(1, 1);
    const point1x2y = new Vector(1, 2);
    const point2x2y = new Vector(2, 2);

    // ______________[ Tests ]

    it('isEqual', () => {
        expect(Vector.isEqual(point1x1y, point1x1y)).toBe(true);
        expect(Vector.isEqual(point1x1y, point1x1y.clone())).toBe(true);
        expect(Vector.isEqual(point1x1y, point1x1y.scale(1))).toBe(true);
        expect(
            Vector.isEqual(point1x1y, point1x1y.scale(100).scale(1 / 100)),
        ).toBe(true);
        expect(Vector.isEqual(point1x1y, point2x2y.scale(1 / 2))).toBe(true);
        expect(Vector.isEqual(point0x0y, {})).toBe(true);
        expect(Vector.isEqual({}, {})).toBe(true);

        expect(Vector.isEqual(point1x1y, point2x2y)).toBe(false);
        expect(Vector.isEqual(point1x1y, {})).toBe(false);
    });

    it('length', () => {
        expect(point1x1y.length()).toBeCloseTo(1.41, 0.1);
        expect(point2x2y.length()).toBeCloseTo(1.41 * 2, 0.1);
        expect(point2x2y.length(point1x1y)).toBeCloseTo(1.41, 0.1);
        expect(point2x2y.length(point1x2y)).toEqual(1);
    });

});

*/