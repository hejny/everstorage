import { MemoryStorage } from '../src/classes/MemoryStorage';

describe('MemoryStorage', () => {
    // ______________[ Setup ]

    // TODO: Test all IStorages
    const storage = new MemoryStorage();

    // ______________[ Tests ]

    it('length and setItem', () => {
        expect(storage.length).toBe(0);
        storage.setItem('a', 'aa');
        expect(storage.length).toBe(1);
        storage.setItem('b', 'bb');
        expect(storage.length).toBe(2);
        storage.setItem('c', 'cc');
        expect(storage.length).toBe(3);
    });

    it('getItem', () => {
        expect(storage.getItem('a')).toBe('aa');
        expect(storage.getItem('b')).toBe('bb');
        expect(storage.getItem('c')).toBe('cc');
        expect(storage.getItem('d')).toBeNull();
    });

    it('key', () => {
        expect(storage.key(0)).toBe('a');
        expect(storage.key(1)).toBe('b');
        expect(storage.key(2)).toBe('c');
        expect(storage.key(3)).toBeNull();
        expect(storage.getItem(storage.key(0)!)).toBe('aa');
    });

    it('removeItem', () => {
        storage.removeItem('a');
        expect(storage.getItem('a')).toBeNull();
    });

    it('clear', () => {
        storage.clear();
        expect(storage.length).toBe(0);
    });
});
