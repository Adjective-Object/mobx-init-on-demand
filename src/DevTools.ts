import type { OnDemandObservable } from './OnDemandObservable';

interface DevToolsContext {
    numOnDemandObservablesCreated: number;
    numOnDemandObservablesWrapped: number;
}
declare global {
    interface Window {
        __mliooDebug: {
            _context: DevToolsContext;
            ratio: number;
        };
    }
}

function _initializeDevtoolsContext() {
    if (window.__mliooDebug === undefined) {
        window.__mliooDebug = {
            _context: {
                numOnDemandObservablesCreated: 0,
                numOnDemandObservablesWrapped: 0,
            },
            get ratio(this: DevToolsContext) {
                return (
                    this.numOnDemandObservablesWrapped /
                    this.numOnDemandObservablesCreated
                );
            },
        };
    }
}

export function getDevtoolsContext() {
    return window.__mliooDebug;
}

export function onOnDemandObservableCreated(
    _onDemandObservable?: OnDemandObservable<any>,
) {
    _initializeDevtoolsContext();
    getDevtoolsContext()._context.numOnDemandObservablesCreated++;
}

export function onOnDemandObservableWrapped(
    _onDemandObservable?: OnDemandObservable<any>,
) {
    _initializeDevtoolsContext();
    getDevtoolsContext()._context.numOnDemandObservablesWrapped++;
}
