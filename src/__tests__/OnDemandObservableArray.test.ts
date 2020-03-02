import { autorun, isObservable, isObservableArray } from 'mobx';
import { setObservableWrapper } from '../wrapWithDI';
import { wrapAsOnDemandObservable } from '../wrapAsOnDemandObservable';
import OnDemandObservableArray from '../OnDemandObservableArray';

describe('OnDemandObservableArray', () => {
    let disposer: () => void;
    beforeEach(() => {
        setObservableWrapper(wrapAsOnDemandObservable);
    });

    afterEach(() => {
        disposer && disposer();
    });

    it('reads initial values from an initial array', () => {
        // Arrange
        const x = new OnDemandObservableArray([1, 2, 3]);

        // Assert
        expect(x[0]).toEqual(1);
        expect(x[1]).toEqual(2);
        expect(x[2]).toEqual(3);
    });

    it('can be iterated over with for..of', () => {
        const x = new OnDemandObservableArray<number>([1, 2, 3, 4]);

        const iteratedValues = [];
        for (let y of x) {
            iteratedValues.push(y);
        }

        expect(iteratedValues).toEqual([1, 2, 3, 4]);
    });

    it('can be iterated over with for..in', () => {
        const x = new OnDemandObservableArray<number>([1, 2, 3, 4]);

        const iteratedValues = [];
        for (let y in x) {
            iteratedValues.push(y);
        }

        expect(iteratedValues).toEqual(['0', '1', '2', '3']);
    });

    it('can be iterated over with for..in after shrinking', () => {
        const x = new OnDemandObservableArray<number>([1, 2, 3, 4]);

        x.pop();

        const iteratedValues = [];
        for (let y in x) {
            iteratedValues.push(y);
        }

        expect(iteratedValues).toEqual(['0', '1', '2']);
    });

    it('can be iterated over with for..in after shrinking and adding', () => {
        const x = new OnDemandObservableArray<number>([1, 2, 3, 4]);

        x.pop();
        x.push(5);
        x.pop();
        x.push(9);
        x.shift();

        const iteratedValues = [];
        for (let y in x) {
            iteratedValues.push(y);
        }

        expect(iteratedValues).toEqual(['0', '1', '2']);
    });

    it('reacts when you add values', () => {
        // Arrange
        const x = new OnDemandObservableArray<string>([]);
        const observedValues: string[][] = [];
        disposer = autorun(() => {
            observedValues.push([...x]);
        });

        // Act
        x.push('welcome');
        x.push('to');
        x.push('the');
        x.push('jam');

        // Assert
        expect(observedValues).toEqual([
            [],
            ['welcome'],
            ['welcome', 'to'],
            ['welcome', 'to', 'the'],
            ['welcome', 'to', 'the', 'jam'],
        ]);
    });

    it('can write values directly', () => {
        const wrappedObservable = new OnDemandObservableArray(['1', '2']);

        // Act
        wrappedObservable[1] = '3';

        expect([...wrappedObservable]).toEqual(['1', '3']);
    });

    describe.skip('mobx interop', () => {
        it('is an observable array', () => {
            let x = new OnDemandObservableArray([]);
            expect(isObservableArray(x)).toBe(true);
        });

        it('passes isObservable', () => {
            let x = new OnDemandObservableArray([]);
            expect(isObservable(x)).toBe(true);
        });
    });
});
