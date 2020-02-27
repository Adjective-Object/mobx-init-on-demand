import { MobxLateInitObservableObject } from '../MobxLateInitObservableObject';
import { autorun, comparer, observable, spy } from 'mobx';

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
            } = MobxLateInitObservableObject.wrap({
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
            } = MobxLateInitObservableObject.wrap({
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
            } = MobxLateInitObservableObject.wrap({
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

            const lazyStore = MobxLateInitObservableObject.wrap({
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

        // TODO multiple add events get fired for each of the 2 shallow observables we have in our wrapper,
        // so this fails..
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

            const lazyStore = MobxLateInitObservableObject.wrap({
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
