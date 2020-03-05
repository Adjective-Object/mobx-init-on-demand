import * as DevTools from '../DevTools';

describe('DevTools', () => {
    beforeEach(() => {
        delete window.__mliooDebug;
    });

    describe('basic operations', () => {
        describe('onOnDemandObservableCreated', () => {
            it('initializes the devtools context', () => {
                DevTools.onOnDemandObservableCreated();

                expect(window.__mliooDebug).not.toBeUndefined();
            });

            it('increments numOnDemandObservablesCreated', () => {
                DevTools.onOnDemandObservableCreated();

                const oldValue =
                    window.__mliooDebug._context.numOnDemandObservablesCreated;

                DevTools.onOnDemandObservableCreated();

                expect(
                    window.__mliooDebug._context.numOnDemandObservablesCreated,
                ).toBe(oldValue + 1);
            });
        });

        describe('onOnDemandObservableWrapped', () => {
            it('initializes the devtools context', () => {
                DevTools.onOnDemandObservableWrapped();

                expect(window.__mliooDebug).not.toBeUndefined();
            });

            it('increments numOnDemandObservablesWrapped', () => {
                DevTools.onOnDemandObservableWrapped();

                const oldValue =
                    window.__mliooDebug._context.numOnDemandObservablesWrapped;

                DevTools.onOnDemandObservableWrapped();

                expect(
                    window.__mliooDebug._context.numOnDemandObservablesWrapped,
                ).toBe(oldValue + 1);
            });
        });

        describe('getDevtoolsContext', () => {
            DevTools.onOnDemandObservableCreated();
            expect(DevTools.getDevtoolsContext()).toBe(window.__mliooDebug);
        });
    });
});
