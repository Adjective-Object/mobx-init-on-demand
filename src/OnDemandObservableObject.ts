import { observable, decorate, transaction, isObservable } from 'mobx';
import { MobxLateInitInnerSymbol } from './constants';
import { isOnDemandObservable } from './isOnDemandObservable';
import { wrapObservable } from './wrapWithDI';
import { OnDemandObservable } from './OnDemandObservable';

export function isObject(value: any): value is object {
    return value !== null && typeof value === 'object';
}

/**
 * Wraps a shallow mobx observable object and initializes only those
 * properties
 */
export class OnDemandObservableObject<
    T extends object
> extends OnDemandObservable<T> {
    /**
     * This is a lazily shallow wrapped inner object, storing T
     */
    [MobxLateInitInnerSymbol]: T;

    static wrap<T extends object>(wrappedObject: T): T {
        if (!isObject(wrappedObject)) {
            return wrappedObject;
        }

        let wrapped = transaction(
            () => new OnDemandObservableObject(wrappedObject),
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

        // define accessors on this object that proxy property reads
        Object.defineProperty(proxyObject, MobxLateInitInnerSymbol, {
            get: () => true,
            enumerable: false,
        });

        return proxyObject as T;
    }

    private constructor(wrappedObject: T) {
        super();
        this[MobxLateInitInnerSymbol] = wrappedObject;
    }

    private _readProperty(propertyName: keyof T) {
        // If the value is stored as a scalar, just return it
        this._ensureWrapped();
        const oldValue = this[MobxLateInitInnerSymbol][propertyName];
        if (!isObject(oldValue)) {
            return this[MobxLateInitInnerSymbol][propertyName];
        }

        // If the object is not wrapped yet, wrap it.
        // Set it before wrapping the parent object in observable
        if (!isOnDemandObservable(oldValue)) {
            this[MobxLateInitInnerSymbol][propertyName] = wrapObservable(
                oldValue,
            );
        }

        return this[MobxLateInitInnerSymbol][propertyName];
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
                this[MobxLateInitInnerSymbol][propertyName] = newValue;
                return;
            }

            // we are writing an object
            this[MobxLateInitInnerSymbol][propertyName] = isOnDemandObservable(
                newValue,
            )
                ? newValue
                : (wrapObservable(newValue) as any);
        });
    }

    _wrap() {
        this[MobxLateInitInnerSymbol] = observable.object(
            // Copy the object when we wrap, so that the original copy
            // that we pass in isn't mutated by mobx.
            { ...this[MobxLateInitInnerSymbol] },
            undefined, //decorators
            {
                deep: false,
            },
        );
    }
}
