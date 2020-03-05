import * as DevTools from '../DevTools';
import { setObservableWrapper } from '../wrapWithDI';
import { wrapAsOnDemandObservable } from '../wrapAsOnDemandObservable';

const mockNodeEnv = (mockedValue: string) =>
    beforeEach(() => {
        process.env.NODE_ENV = mockedValue;
    });

describe('DevTools', () => {
    beforeEach(() => {
        delete window.__mliooDebug;
        setObservableWrapper(wrapAsOnDemandObservable);
    });

    describe('in dev', () => {
        mockNodeEnv('development');

        it('tracks nested data structures being created data structure', () => {
            const wrappedDataStructure = wrapAsOnDemandObservable({
                x: new Map<string, any>([
                    [
                        'a',
                        {
                            name: 'pete',
                            shoe: { size: 9, style: 'flat' },
                            alternateNames: ['peter', 'petrov'],
                        },
                    ],
                    [
                        'b',
                        {
                            name: 'joe',
                            shoe: {
                                size: 10,
                                style: 'sneaker',
                                alternateNames: ['joseph', 'joeline'],
                            },
                        },
                    ],
                    ['c', { name: 'liz', shoe: { size: 8, style: 'boot' } }],
                    ['d', { name: 'jeb', shoe: { size: 11, style: 'heel' } }],
                    [
                        'e',
                        { name: 'amy', shoe: { size: 10.5, style: 'flats' } },
                    ],
                ]),
            });

            expect(
                DevTools.getDevtoolsContext()._context
                    .numOnDemandObservablesCreated,
            ).toBe(1);
            expect(
                DevTools.getDevtoolsContext()._context
                    .numOnDemandObservablesWrapped,
            ).toBe(0);
        });

        it('tracks nested data structures being created and wrapped', () => {
            const wrappedDataStructure = wrapAsOnDemandObservable({
                x: new Map<string, any>([
                    [
                        'a',
                        {
                            name: 'pete',
                            shoe: { size: 9, style: 'flat' },
                            alternateNames: ['peter', 'petrov'],
                        },
                    ],
                    [
                        'b',
                        {
                            name: 'joe',
                            shoe: {
                                size: 10,
                                style: 'sneaker',
                                alternateNames: ['joseph', 'joeline'],
                            },
                        },
                    ],
                    ['c', { name: 'liz', shoe: { size: 8, style: 'boot' } }],
                    ['d', { name: 'jeb', shoe: { size: 11, style: 'heel' } }],
                    [
                        'e',
                        { name: 'amy', shoe: { size: 10.5, style: 'flats' } },
                    ],
                ]),
            });

            // create and wrap some nested data structures
            wrappedDataStructure.x.get('a')!.name;
            wrappedDataStructure.x.get('a')!.alternateNames[0];
            wrappedDataStructure.x.get('a')!.shoe.size;
            // create but don't wrap some more observables
            wrappedDataStructure.x.get('b');
            wrappedDataStructure.x.get('c');
            wrappedDataStructure.x.get('d');

            expect(DevTools.getDevtoolsContext()._context).toEqual(
                jasmine.objectContaining({
                    numOnDemandObservablesCreated: 9,
                    numOnDemandObservablesWrapped: 6,
                }),
            );
        });
    });

    describe('in prod', () => {
        mockNodeEnv('production');

        it('does not initialize the devtools context', () => {
            const wrappedDataStructure = wrapAsOnDemandObservable({
                x: new Map<string, any>([
                    [
                        'a',
                        {
                            name: 'pete',
                            shoe: { size: 9, style: 'flat' },
                            alternateNames: ['peter', 'petrov'],
                        },
                    ],
                    [
                        'b',
                        {
                            name: 'joe',
                            shoe: {
                                size: 10,
                                style: 'sneaker',
                                alternateNames: ['joseph', 'joeline'],
                            },
                        },
                    ],
                    ['c', { name: 'liz', shoe: { size: 8, style: 'boot' } }],
                    ['d', { name: 'jeb', shoe: { size: 11, style: 'heel' } }],
                    [
                        'e',
                        { name: 'amy', shoe: { size: 10.5, style: 'flats' } },
                    ],
                ]),
            });

            // create and wrap some nested data structures
            wrappedDataStructure.x.get('a')!.name;
            wrappedDataStructure.x.get('a')!.alternateNames[0];
            wrappedDataStructure.x.get('a')!.shoe.size;
            // create but don't wrap some more observables
            wrappedDataStructure.x.get('b');
            wrappedDataStructure.x.get('c');
            wrappedDataStructure.x.get('d');

            expect(DevTools.getDevtoolsContext()).toBeUndefined();
        });
    });
});
