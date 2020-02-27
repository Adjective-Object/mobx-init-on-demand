import { MobxLateInitObservableObject } from '../MobxLateInitObservableObject';
import { autorun, comparer, observable } from 'mobx';

describe('MobxLateInitObservableObject', () => {
    let disposer: () => void;
    afterEach(() => {
        disposer && disposer();
    });

    describe('reading and writing scalars on an object', () => {
        it('reads the initial value correctly', () => {
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: '1',
            });

            expect(wrappedObservable.a).toEqual('1');
        });

        it('reads updated values', () => {
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: '1',
            });

            wrappedObservable.a = '2';

            expect(wrappedObservable.a).toEqual('2');
        });

        it('triggers listeners to the wrapped properties on overwrite', () => {
            // Arrange
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: '1',
            });

            const observedValues: string[] = [];
            disposer = autorun(() => {
                observedValues.push(wrappedObservable.a);
            });

            // Act
            wrappedObservable.a = '2';

            // Assert
            expect(observedValues).toEqual(['1', '2']);
        });
    });

    describe('reading and writing scalars on a subobject', () => {
        it('reads the initial value correctly', () => {
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            expect(wrappedObservable.a.b).toEqual(1);
        });

        it('reads updated values', () => {
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            wrappedObservable.a.b = 3;

            expect(wrappedObservable.a.b).toEqual(3);
        });

        it('triggers listeners to the wrapped properties on overwrite', () => {
            // Arrange
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            const observedValues: number[] = [];
            disposer = autorun(() => {
                observedValues.push(wrappedObservable.a.b);
            });

            // Act
            wrappedObservable.a.b = 3;

            // Assert
            expect(observedValues).toEqual([1, 3]);
        });
    });

    describe('reading and writing subobjects', () => {
        it('reads the initial value correctly', () => {
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            expect(wrappedObservable.a).toEqual({ b: 1 });
        });

        it('reads updated values', () => {
            const wrappedObservable = MobxLateInitObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            wrappedObservable.a = {
                b: 2,
            };

            expect(wrappedObservable.a).toEqual({ b: 2 });
        });

        it('triggers listeners to the wrapped properties on overwrite', () => {
            // Arrange
            const wrappedObservable: {
                a: any;
            } = MobxLateInitObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            const observedValues: any[] = [];
            disposer = autorun(() => {
                observedValues.push(wrappedObservable.a);
            });

            // Act
            wrappedObservable.a = {
                c: 2,
            };

            // Assert
            expect(observedValues).toEqual([
                {
                    b: 1,
                },
                { c: 2 },
            ]);
        });
    });

    describe("changing the type of a property over the object's lifetime from scalar => object", () => {
        it('reads the updated value', () => {
            // Arrange
            const wrappedObservable: any = MobxLateInitObservableObject.wrap({
                a: 1,
            });

            // Act
            wrappedObservable.a = {
                b: 1,
            };

            // Assert
            expect(wrappedObservable.a).toEqual({
                b: 1,
            });
        });

        it('triggers observers when changing from scalar => object', () => {
            // Arrange
            const wrappedObservable: any = MobxLateInitObservableObject.wrap({
                a: 1,
            });

            const observedValues: number[] = [];
            disposer = autorun(() => {
                observedValues.push(wrappedObservable.a);
            });

            // Act
            wrappedObservable.a = {
                b: 1,
            };

            // Assert
            expect(observedValues).toEqual([
                1,
                {
                    b: 1,
                },
            ]);
        });
    });

    describe("changing the type of a property over the object's lifetime from object => scalar", () => {
        it('reads the updated value', () => {
            // Arrange
            const wrappedObservable: any = MobxLateInitObservableObject.wrap({
                a: { z: 'hello' },
            });

            // Act
            wrappedObservable.a = 'goodbye';

            // Assert
            expect(wrappedObservable.a).toEqual('goodbye');
        });

        it('triggers observers when changing from object => scalar', () => {
            // Arrange
            const wrappedObservable: any = MobxLateInitObservableObject.wrap({
                a: { z: 'hello' },
            });

            const observedValues: number[] = [];
            disposer = autorun(() => {
                observedValues.push(wrappedObservable.a);
            });

            // Act
            wrappedObservable.a = 'goodbye';

            // Assert
            expect(observedValues).toEqual([{ z: 'hello' }, 'goodbye']);
        });
    });

    //
    // Trying all combinations of a set of objects
    // and checking that behaviour matches mobx.
    //
    describe('enumeration and equality', () => {
        const testCases = [
            // base case
            {},
            // simple
            { a: '1' },
            // simple nested
            { a: { b: 1, c: '2' } },
        ];

        function allPairs(arr: any[]): [any, any][] {
            const toRet: [any, any][] = [];
            for (let i = 0; i < arr.length; i++) {
                for (let j = i; j < arr.length; j++) {
                    toRet.push([arr[i], arr[j]]);
                }
            }
            return toRet;
        }

        for (let [name, thisComparer] of [
            ['JSON.stringify', (a, b) => JSON.stringify([a, b])],
            ['mobx comparer.structural', comparer.structural],
            ['mobx comparer.shallow', comparer.shallow],
            ['mobx comparer.identity', comparer.identity],
            ['mobx comparer.default', comparer.default],
        ] as [string, (a: any, b: any) => any][]) {
            describe(name, () => {
                for (let [case1, case2] of allPairs(testCases)) {
                    it(`compares wrapped(${JSON.stringify(
                        case1,
                    )}) to ${JSON.stringify(
                        case2,
                    )} the same as if it were unwrapped`, () => {
                        const mobxOut = thisComparer(observable(case1), case2);

                        const wrappedMobxOut = thisComparer(
                            MobxLateInitObservableObject.wrap(case1),
                            case2,
                        );

                        expect(wrappedMobxOut).toBe(mobxOut);
                    });
                }
            });
        }
    });
});
