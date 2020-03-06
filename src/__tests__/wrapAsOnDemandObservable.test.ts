import { wrapAsOnDemandObservable } from '../wrapAsOnDemandObservable';
import { OnDemandObservableMap } from '../OnDemandObservableMap';
import { isOnDemandObservable } from '../isOnDemandObservable';
import { ObservableSet, observable, ObservableMap } from 'mobx';
import { OnDemandObservableArray } from '../OnDemandObservableArray';

describe('wrapAsOnDemandObservable', () => {
    describe('builtin data structures', () => {
        it('wraps an object as an on demand observable', () => {
            // Arrange
            const x = wrapAsOnDemandObservable({});
            // Assert
            expect(isOnDemandObservable(x)).toBe(true);
        });

        it('wraps a map as an on demand observable map', () => {
            // Arrange
            const x = wrapAsOnDemandObservable(new Map());
            // Assert
            expect(isOnDemandObservable(x)).toBe(true);
            expect(x).toBeInstanceOf(OnDemandObservableMap);
        });

        it('wraps a set as an observable set', () => {
            // Arrange
            const x = wrapAsOnDemandObservable(new Set());
            // Assert
            // This is not an observable set
            expect(isOnDemandObservable(x)).toBe(false);
            expect(x).toBeInstanceOf(ObservableSet);
        });

        it('wraps an array as an observable array', () => {
            // Arrange
            const x = wrapAsOnDemandObservable([]);
            // Assert
            expect(isOnDemandObservable(x)).toBe(true);
            expect(x).toBeInstanceOf(OnDemandObservableArray);
        });
    });

    describe('mobx data structures', () => {
        it('wraps an observable object as an on demand observable', () => {
            // Arrange
            const x = wrapAsOnDemandObservable(observable.object({}));
            // Assert
            expect(isOnDemandObservable(x)).toBe(true);
        });

        it('wraps an observable map as an on demand observable map', () => {
            // Arrange
            const x = wrapAsOnDemandObservable(observable.map(new Map()));
            // Assert
            expect(isOnDemandObservable(x)).toBe(true);
            expect(x).toBeInstanceOf(OnDemandObservableMap);
        });

        it('wraps a new ObservableMap() as an on demand observable map', () => {
            // Arrange
            const x = wrapAsOnDemandObservable(new ObservableMap(new Map()));
            // Assert
            expect(isOnDemandObservable(x)).toBe(true);
            expect(x).toBeInstanceOf(OnDemandObservableMap);
        });

        it('wraps an observable set as an observable set', () => {
            // Arrange
            const x = wrapAsOnDemandObservable(observable.set(new Set()));
            // Assert
            expect(x).toBeInstanceOf(ObservableSet);
        });

        it('wraps a new ObservableSet() as an observable set', () => {
            // Arrange
            const originalObservableSet = new ObservableSet(new Set());
            const x = wrapAsOnDemandObservable(originalObservableSet);
            // Assert
            expect(x).toBeInstanceOf(ObservableSet);
            expect(x).not.toBe(originalObservableSet);
        });

        it('wraps an observable array as an observable array', () => {
            // Arrange
            const x = wrapAsOnDemandObservable(observable.array([]));
            // Assert
            expect(isOnDemandObservable(x)).toBe(true);
            expect(x).toBeInstanceOf(OnDemandObservableArray);
        });
    });
});
