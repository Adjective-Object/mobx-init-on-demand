import { observable, decorate, transaction, isObservable } from 'mobx';

function isObject(value: any): value is object {
    return value !== null && typeof value === 'object';
}

function isWrappedObject(value: object) {
    return !!Reflect.get(value, MobxLateInitWrappedSymbol);
}

const MobxLateInitWrappedSymbol = Symbol('mlioo.wrapped');

/**
 * Wraps a shallow mobx observable object and initializes only those
 * properties
 *
 * Properties with scalar values are stored on the actual ._internal object.
 *
 * When first read, properties with non-scalar values are put in the _wrappedInternal map,
 * and wrapped in another MobxLateInitObservableObject
 */
export class MobxLateInitObservableObject<T extends object> {
    /**
     * Scalar values are stored here
     */
    _internal: any;

    static wrap<T extends object>(wrappedObject: T): T {
        let wrapped = transaction(
            () => new MobxLateInitObservableObject(wrappedObject),
        );

        const proxyObject = {};

        for (let _key of Reflect.ownKeys(wrappedObject)) {
            const key = _key as keyof T;
            // define accessors on this object that proxy property reads
            Object.defineProperty(proxyObject, key, {
                get: wrapped!._readProperty.bind(wrapped!, key),
                set: wrapped!._writeProperty.bind(wrapped!, key),
                enumerable: true,
            });
        }

        Object.defineProperty(proxyObject, MobxLateInitWrappedSymbol, {
            get: () => true,
            enumerable: false,
        });

        return proxyObject as T;
    }

    private constructor(wrappedObject: T) {
        this._internal = wrappedObject;
    }

    private _readProperty(propertyName: keyof T) {
        this.ensureDecorated();

        // If the value is stored as a scalar, just return it
        if (!isObject(this._internal[propertyName])) {
            return this._internal[propertyName];
        }

        // If the object is not wrapped yet, wrap it.
        if (!isWrappedObject(this._internal[propertyName])) {
            this._internal[propertyName] = MobxLateInitObservableObject.wrap(
                this._internal[propertyName],
            );
        }

        return this._internal[propertyName];
    }

    private _writeProperty<TKey extends keyof T>(
        propertyName: TKey,
        newValue: any,
    ) {
        // Perform in a transaction so any observers triggered by clearing observable values
        // read back updated values first.
        transaction(() => {
            if (!isObject(newValue)) {
                // we are writing a scalar
                this._internal[propertyName] = newValue;
                return;
            }

            // we are writing an object
            this._internal[propertyName] = isWrappedObject(newValue)
                ? newValue
                : (MobxLateInitObservableObject.wrap(newValue) as any);
        });
    }

    private ensureDecorated() {
        if (isObservable(this)) {
            return;
        }

        // initialize this with decorate after values have been set,
        // because otherwise we trigger an extra mobx update trigger
        // when we set the values above.
        decorate(this, {
            _internal: observable.shallow,
        });
    }
}
