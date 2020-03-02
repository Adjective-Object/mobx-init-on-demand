// HACK DI this index to avoid circular references
// because each observable wrapper object
// must be able to wrap non-scalar values lazily
let _wrapObservable = function uninitializedWrapObservable(
    ...args: any[]
): any {
    throw new Error(
        'wrapObservable not initialized. Did you forget to import from the package index?',
    );
};
export function wrapObservable(this: any, ...args: any[]): any {
    return _wrapObservable.apply(this, args);
}
export const setObservableWrapper = (handler: (...args: any[]) => any) => {
    _wrapObservable = handler;
};
