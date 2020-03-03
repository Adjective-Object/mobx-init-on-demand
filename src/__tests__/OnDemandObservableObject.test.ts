import { OnDemandObservableObject } from '../OnDemandObservableObject';
import {
    autorun,
    comparer,
    observable,
    spy,
    isObservable,
    isObservableObject,
} from 'mobx';
import { setObservableWrapper } from '../wrapWithDI';
import { wrapAsOnDemandObservable } from '../wrapAsOnDemandObservable';
import { isOnDemandObservable } from '../isOnDemandObservable';
import { OnDemandObservableArray } from '../OnDemandObservableArray';

describe('OnDemandObservableObject', () => {
    let disposer: () => void;
    beforeEach(() => {
        setObservableWrapper(wrapAsOnDemandObservable);
    });

    afterEach(() => {
        disposer && disposer();
    });

    describe('reading and writing scalars on an object', () => {
        it('reads the initial value correctly', () => {
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: '1',
            });

            expect(wrappedObservable.a).toEqual('1');
        });

        it('reads updated values', () => {
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: '1',
            });

            wrappedObservable.a = '2';

            expect(wrappedObservable.a).toEqual('2');
        });

        it('triggers listeners to the wrapped properties on overwrite', () => {
            // Arrange
            const wrappedObservable = OnDemandObservableObject.wrap({
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
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            expect(wrappedObservable.a.b).toEqual(1);
        });

        it('reads updated values', () => {
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            wrappedObservable.a.b = 3;

            expect(wrappedObservable.a.b).toEqual(3);
        });

        it('triggers listeners to the wrapped properties on overwrite', () => {
            // Arrange
            const wrappedObservable = OnDemandObservableObject.wrap({
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
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: {
                    b: 1,
                },
            });

            expect(wrappedObservable.a).toEqual({ b: 1 });
        });

        it('reads updated values', () => {
            const wrappedObservable = OnDemandObservableObject.wrap({
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
            } = OnDemandObservableObject.wrap({
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
            const wrappedObservable: any = OnDemandObservableObject.wrap({
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
            const wrappedObservable: any = OnDemandObservableObject.wrap({
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
            const wrappedObservable: any = OnDemandObservableObject.wrap({
                a: { z: 'hello' },
            });

            // Act
            wrappedObservable.a = 'goodbye';

            // Assert
            expect(wrappedObservable.a).toEqual('goodbye');
        });

        it('triggers observers when changing from object => scalar', () => {
            // Arrange
            const wrappedObservable: any = OnDemandObservableObject.wrap({
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

    describe('lazy initialization', () => {
        it('Does not fire mutation events on store creation', () => {
            // Arrange
            const mobxEventLog: any[] = [];
            spy(event => mobxEventLog.push(event));

            type MyObject = {
                name: string;
                config: null | {
                    onlineStatus: 'online' | 'away' | 'busy';
                };
            };

            // Act
            const store: {
                scenarioObjects: Record<string, MyObject>;
            } = OnDemandObservableObject.wrap({
                scenarioObjects: {
                    id_m: {
                        name: 'max',
                        config: null,
                    },
                    id_j: {
                        name: 'jeff',
                        config: {
                            onlineStatus: 'online',
                        },
                    },
                    id_w: {
                        name: 'will',
                        config: {
                            onlineStatus: 'busy',
                        },
                    },
                },
            });

            // Assert
            expect(mobxEventLog).toEqual([]);
        });

        it('Fires mobx events only for keys in objects we have accessed', () => {
            // Arrange
            const mobxEventLog: any[] = [];
            (global as any).mobxEventLog = mobxEventLog;
            spy(event => {
                mobxEventLog.push(event);
            });

            type MyObject = {
                name: string;
                config: null | {
                    onlineStatus: 'online' | 'away' | 'busy';
                };
            };

            // Act
            const store: {
                scenarioObjects: Record<string, MyObject>;
            } = OnDemandObservableObject.wrap({
                scenarioObjects: {
                    id_m: {
                        name: 'max',
                        config: null,
                    },
                    id_j: {
                        name: 'jeff',
                        config: {
                            onlineStatus: 'online',
                        },
                    },
                    id_w: {
                        name: 'will',
                        config: {
                            onlineStatus: 'busy',
                        },
                    },
                },
            });
            // noop that reads the conifg of both users
            store.scenarioObjects;

            // event log should not be empty
            expect(mobxEventLog).not.toEqual([]);
            const updatedKeys = mobxEventLog
                .filter(x => x.key !== undefined)
                .map(x => x.key);
            // keys deeper in the store should not be initialized
            expect(updatedKeys).not.toContain('cofig');
        });

        it('does not fire additional mobx events for reads of already initialized keys', () => {
            // Arrange
            const mobxEventLog: any[] = [];
            (global as any).mobxEventLog = mobxEventLog;
            spy(event => {
                mobxEventLog.push(event);
            });

            type MyObject = {
                name: string;
                config: null | {
                    onlineStatus: 'online' | 'away' | 'busy';
                };
            };

            // Act
            const store: {
                scenarioObjects: Record<string, MyObject>;
            } = OnDemandObservableObject.wrap({
                scenarioObjects: {
                    id_m: {
                        name: 'max',
                        config: null,
                    },
                    id_j: {
                        name: 'jeff',
                        config: {
                            onlineStatus: 'online',
                        },
                    },
                    id_w: {
                        name: 'will',
                        config: {
                            onlineStatus: 'busy',
                        },
                    },
                },
            });
            // noop that reads the conifg of both users
            store.scenarioObjects;
            const eventLengthAfterLazyInitialization = mobxEventLog.length;
            store.scenarioObjects;

            // Assert
            expect(mobxEventLog.length).toBe(
                eventLengthAfterLazyInitialization,
            );
        });
    });

    describe('when an array is added to the wrapped object', () => {
        it('reads initial values in the array correctly', () => {
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: ['1', '2'],
            });

            expect(wrappedObservable.a[0]).toEqual('1');
            expect(wrappedObservable.a[1]).toEqual('2');
        });

        it('wraps internal objects when read', () => {
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: ['1', '2'],
            });

            expect(isOnDemandObservable(wrappedObservable.a)).toBe(true);
            expect(wrappedObservable.a).toBeInstanceOf(OnDemandObservableArray);
        });

        it('reads updated values in the array', () => {
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: ['1', '2'],
            });

            // Act
            wrappedObservable.a[1] = '3';

            expect(wrappedObservable.a[0]).toEqual('1');
            expect(wrappedObservable.a[1]).toEqual('3');
        });

        it('triggers listeners to the wrapped properties on overwrite', () => {
            // Arrange
            const wrappedObservable = OnDemandObservableObject.wrap({
                a: ['1', '2'],
            });

            const observedValues: string[] = [];
            disposer = autorun(() => {
                observedValues.push(wrappedObservable.a[0]);
            });

            // Act
            wrappedObservable.a[0] = 'hello';

            // Assert
            expect(observedValues).toEqual(['1', 'hello']);
        });
    });

    describe('comparing costs', () => {
        it('When initializing, it performs less mobx events than a basic initialization', () => {
            // Arrange
            let mobxEventLog: any[] = [];
            spy(event => mobxEventLog.push(event));

            // Act
            const baseStore = observable({
                scenarioObjects: {
                    id_m: {
                        name: 'max',
                        config: null,
                    },
                    id_j: {
                        name: 'jeff',
                        config: {
                            onlineStatus: 'online',
                        },
                    },
                    id_w: {
                        name: 'will',
                        config: {
                            onlineStatus: 'busy',
                        },
                    },
                    id_s: {
                        name: 'samuele',
                        config: null,
                    },
                    id_r: {
                        name: 'robert',
                        config: null,
                    },
                },
            });
            const baseEventLog = mobxEventLog;
            mobxEventLog = [];

            const lazyStore = OnDemandObservableObject.wrap({
                scenarioObjects: {
                    id_m: {
                        name: 'max',
                        config: null,
                    },
                    id_j: {
                        name: 'jeff',
                        config: {
                            onlineStatus: 'online',
                        },
                    },
                    id_w: {
                        name: 'will',
                        config: {
                            onlineStatus: 'busy',
                        },
                    },
                    id_s: {
                        name: 'samuele',
                        config: null,
                    },
                    id_r: {
                        name: 'robert',
                        config: null,
                    },
                },
            });
            const lazyEventLog = mobxEventLog;

            // Assert
            expect(baseEventLog.length).toBeGreaterThan(lazyEventLog.length);
        });

        it('When scalar properties from a single object in the tree, it performs less mobx events than a basic initialization', () => {
            // Arrange
            let mobxEventLog: any[] = [];
            spy(event => mobxEventLog.push(event));

            // Act
            const baseStore = observable({
                scenarioObjects: {
                    id_m: {
                        name: 'max',
                        config: null,
                    },
                    id_j: {
                        name: 'jeff',
                        config: {
                            onlineStatus: 'online',
                        },
                    },
                    id_w: {
                        name: 'will',
                        config: {
                            onlineStatus: 'busy',
                        },
                    },
                    id_s: {
                        name: 'samuele',
                        config: null,
                    },
                    id_r: {
                        name: 'robert',
                        config: null,
                    },
                },
            });
            baseStore.scenarioObjects.id_w.name;
            baseStore.scenarioObjects.id_w.config?.onlineStatus;
            const baseEventLog = mobxEventLog;
            mobxEventLog = [];

            const lazyStore = OnDemandObservableObject.wrap({
                scenarioObjects: {
                    id_m: {
                        name: 'max',
                        config: null,
                    },
                    id_j: {
                        name: 'jeff',
                        config: {
                            onlineStatus: 'online',
                        },
                    },
                    id_w: {
                        name: 'will',
                        config: {
                            onlineStatus: 'busy',
                        },
                    },
                    id_s: {
                        name: 'samuele',
                        config: null,
                    },
                    id_r: {
                        name: 'robert',
                        config: null,
                    },
                },
            });
            lazyStore.scenarioObjects.id_w.name;
            baseStore.scenarioObjects.id_w.config?.onlineStatus;
            const lazyEventLog = mobxEventLog;

            // Assert
            expect(baseEventLog.length).toBeGreaterThan(lazyEventLog.length);
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
            ['javascript loose equality', (a, b) => a == b],
            ['javascript strict equality', (a, b) => a === b],
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
                    )} the same as if it were wrapped by mobx`, () => {
                        const mobxOut = thisComparer(observable(case1), case2);

                        const wrappedMobxOut = thisComparer(
                            OnDemandObservableObject.wrap(case1),
                            case2,
                        );

                        expect(wrappedMobxOut).toBe(mobxOut);
                    });
                }
            });
        }
    });

    describe.skip('mobx interop', () => {
        it('is an observable object', () => {
            const x = OnDemandObservableObject.wrap({});
            expect(isObservableObject(x)).toBe(true);
        });

        it('passes isObservable', () => {
            const x = OnDemandObservableObject.wrap({});
            expect(isObservable(x)).toBe(true);
        });
    });
});
