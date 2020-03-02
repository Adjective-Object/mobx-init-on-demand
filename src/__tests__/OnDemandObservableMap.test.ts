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
