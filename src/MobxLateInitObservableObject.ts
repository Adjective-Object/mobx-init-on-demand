import { observable, decorate } from 'mobx';

function isObject(value: any): value is object {
    return value !== null && typeof value === 'object';
}

/**
 * Wraps a shallow mobx observable object and initializes only those
 * properties
 *
 * Properties with scalar values are stored on the actual ._internal object.
 *
 * When first read, properties with non-scalar values are put in the _wrappedInternal map,
 * and wrapped in another MobxLateInitObservableObject
 */
export class MobxLateInitObservableObject {
    private _internal: any;
    private _wrappedInternal: Map<
        string,
        MobxLateInitObservableObject
    > = new Map();

    static wrap<T extends object>(wrappedObject: T): T {
        return new MobxLateInitObservableObject(wrappedObject) as T;
    }

    private constructor(wrappedObject: object) {
        const decorators: { [key: string]: any } = {};
        for (let key of Object.keys(wrappedObject)) {
            // make all keys of the wrapped object observable
            decorators[key] = observable.shallow;

            // define accessors on this object that proxy property reads
            Object.defineProperty(this, key, {
                get: this._readProperty.bind(this, key),
                set: this._writeProperty.bind(this, key),
            });
        }

        this._internal = decorate(wrappedObject, decorators);
    }

    private _readProperty(propertyName: string) {
        // If the value is stored as a scalar
        if (!this._wrappedInternal.has(propertyName)) {
            if (!isObject(this._internal[propertyName])) {
                return this._internal[propertyName];
            }
        }

        if (!this._wrappedInternal.has(propertyName)) {
            this._wrappedInternal.set(
                propertyName,
                new MobxLateInitObservableObject(this._internal),
            );
        }

        return this._wrappedInternal.get(propertyName);
    }

    private _writeProperty(propertyName: string, newValue: any) {
        if (!isObject(newValue)) {
            this._internal[propertyName] = newValue;
            // TODO I think this might be unsound? We need to trigger the observer if
            // this gets read, I think?
            this._wrappedInternal.delete(propertyName);
            return;
        }

        // we are writing an object

        if (
            !isObject(this._internal[propertyName]) &&
            this._internal[propertyName] !== undefined
        ) {
            // Unset the old value in the observable if it was a scalar.
            //
            // This is to trigger any listeners to the property so they will
            // re-call _readProperty and read the value off of the wrapped
            // internal that we set below.
            this._internal[propertyName] = undefined;
        }

        // If we are writing, we need to create a new observable object
        if (!this._wrappedInternal.has(propertyName)) {
            this._wrappedInternal.set(
                propertyName,
                new MobxLateInitObservableObject(newValue),
            );
        }

        this._wrappedInternal.get(propertyName);
    }
}
