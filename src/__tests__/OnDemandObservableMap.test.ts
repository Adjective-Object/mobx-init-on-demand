import { OnDemandObservableMap } from '../OnDemandObservableMap';
import { autorun, isObservableMap, isObservable } from 'mobx';
import { setObservableWrapper } from '../wrapWithDI';
import { wrapAsOnDemandObservable } from '../wrapAsOnDemandObservable';

describe('OnDemandObservableMap', () => {
    let disposer: () => void;
    beforeEach(() => {
        setObservableWrapper(wrapAsOnDemandObservable);
    });

    afterEach(() => {
        disposer && disposer();
    });

    it('reads initial values from an initial object', () => {
        // Arrange
        const x = new OnDemandObservableMap({
            a: 1,
        });

        // Assert
        expect(x.get('a')).toEqual(1);
    });

    it('reads initial values from an initial map', () => {
        // Arrange
        const x = new OnDemandObservableMap(new Map([['a', 1]]));

        // Assert
        expect(x.get('a')).toEqual(1);
    });

    it('reacts when you add values', () => {
        // Arrange
        const x = new OnDemandObservableMap<string, object>({});
        const observedValues: [string, object][][] = [];
        disposer = autorun(() => {
            observedValues.push(Array.from(x.entries()));
        });

        // Act
        x.set('a', { hello: 'goodbye' });

        // Assert
        expect(observedValues).toEqual([[], [['a', { hello: 'goodbye' }]]]);
    });

    it('reacts when you remove values', () => {
        // Arrange
        const x = new OnDemandObservableMap<string, string>({});

        x.set('a', 'A');
        x.set('b', 'B');
        x.set('c', 'C');

        const observedValues: [string, string][][] = [];
        disposer = autorun(() => {
            observedValues.push(Array.from(x.entries()));
        });

        // Act
        x.delete('b');

        // Assert
        expect(observedValues).toEqual([
            [
                ['a', 'A'],
                ['b', 'B'],
                ['c', 'C'],
            ],
            [
                ['a', 'A'],
                ['c', 'C'],
            ],
        ]);
    });

    it('reacts to size changes', () => {
        // Arrange
        const x = new OnDemandObservableMap<string, object>({});
        const observedValues: number[] = [];
        disposer = autorun(() => {
            observedValues.push(x.size);
        });

        // Act
        x.set('a', { hello: 'goodbye' });
        x.set('b', { hello: 'goodbye' });
        x.delete('c');
        x.delete('b');

        // Assert
        expect(observedValues).toEqual([0, 1, 2, 1]);
    });

    it('can get entries', () => {
        const x = new OnDemandObservableMap<string, number>({
            a: 1,
            b: 2,
            c: 3,
        });

        expect(Array.from(x.entries())).toEqual([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]);
    });

    it('can get keys', () => {
        const x = new OnDemandObservableMap<string, number>({
            a: 1,
            b: 2,
            c: 3,
        });

        expect(Array.from(x.keys())).toEqual(
            jasmine.arrayContaining(['a', 'b', 'c']),
        );
        expect(Array.from(x.keys()).length).toBe(3);
    });

    it('can get keys in insertion order', () => {
        const x = new OnDemandObservableMap<string, number>({
            a: 1,
            b: 2,
            d: 3,
        });

        x.set('c', 4);

        expect(Array.from(x.keys())).toEqual(['a', 'b', 'd', 'c']);
    });

    it('can be iterated over with for..of (iterator)', () => {
        const x = new OnDemandObservableMap<string, number>({
            a: 1,
            b: 2,
            c: 3,
        });

        const results: any[] = [];

        for (let iteratedValue of x) {
            results.push(iteratedValue);
        }

        expect(results).toEqual([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]);
    });

    it('can not be iterated over with for..in (enumerable properties)', () => {
        const x = new OnDemandObservableMap<string, number>({
            a: 1,
            b: 2,
            d: 3,
        });

        const results: any[] = [];

        for (let iteratedValue in x) {
            results.push(iteratedValue);
        }

        expect(results).toEqual([]);
    });

    it('can not be iterated over with for..in (enumerable properties), even after wrapping', () => {
        const x = new OnDemandObservableMap<string, number>({
            a: 1,
            b: 2,
            d: 3,
        });

        x.entries();

        const results: any[] = [];

        for (let iteratedValue in x) {
            results.push(iteratedValue);
        }

        expect(results).toEqual([]);
    });

    it('can be iterated over with forEach', () => {
        const x = new OnDemandObservableMap<string, number>({
            a: 1,
            b: 2,
            d: 3,
        });

        const results: any[] = [];

        x.forEach((v, k, map) => {
            results.push([v, k, map]);
        });

        expect(results).toEqual([
            [1, 'a', x],
            [2, 'b', x],
            [3, 'd', x],
        ]);
    });

    describe('mobx interop', () => {
        it('is an observable map', () => {
            let x = new OnDemandObservableMap({});
            expect(isObservableMap(x)).toBe(true);
        });

        it.skip('passes isObservable', () => {
            let x = new OnDemandObservableMap({});
            expect(isObservable(x)).toBe(true);
        });
    });
});
