import { observable, decorate, transaction, isObservable } from 'mobx';
import { isOnDemandObservable } from './isOnDemandObservable';
import { wrapObservable } from './wrapWithDI';
import { MobxLateInitWrappedSymbol } from './constants';

export function isObject(value: any): value is object {
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
class OnDemandObservableArray<T> implements Array<T> {
    /**
     * Internal lazily-initialized observable
     */
    _internal: Array<T>;
    /**
     * Used to track if we need to define new accessors when
     * the underlying array changes.
     */
    _maxLength: number = 0;

    constructor(wrappedObject: Array<T>) {
        this._internal = wrappedObject;
        this._defineAccessorsIfNeeded();

        Object.defineProperty(this, '_internal', {
            enumerable: false,
        });

        Object.defineProperty(this, '_maxLength', {
            enumerable: false,
        });
    }

    private _defineAccessorsIfNeeded() {
        if (this._internal.length > this._maxLength) {
            for (let i = this._internal.length - 1; i >= this._maxLength; i--) {
                Object.defineProperty(this, i, {
                    get: this._readProperty.bind(this, i),
                    set: this._writeProperty.bind(this, i),
                    enumerable: true,
                    // make it configurable so we can delete it later
                    configurable: true,
                });
            }
            this._maxLength = this._internal.length;
        } else if (this._internal.length < this._maxLength) {
            for (let i = this._internal.length; i < this._maxLength; i++) {
                delete this[i];
            }
            this._maxLength = this._internal.length;
        }
    }

    private _readProperty(index: number) {
        this.ensureDecorated();

        const readProp = this._internal[index];

        // If the value is stored as a scalar, just return it
        if (!isObject(readProp)) {
            return readProp;
        }

        // If the object is not wrapped yet, wrap it.
        if (!isOnDemandObservable(readProp)) {
            this._internal[index] = wrapObservable(this._internal[index]);
        }

        return this._internal[index];
    }

    private _writeProperty(index: number, newValue: T) {
        // Perform in a transaction so any observers triggered by clearing observable values
        // read back updated values first.
        transaction(() => {
            if (!isObject(newValue)) {
                // we are writing a scalar
                this._internal[index] = newValue;
                return;
            }

            // we are writing an object
            this._internal[index] = isOnDemandObservable(newValue)
                ? newValue
                : (wrapObservable(newValue) as any);
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

    [Symbol.iterator]() {
        this.ensureDecorated();
        return this._internal[Symbol.iterator]();
    }
}

type ArgsOf<TFunc> = TFunc extends (...args: infer TArgs) => any
    ? TArgs
    : never;
type ReturnOf<TFunc> = TFunc extends (...args: any[]) => infer TReturn
    ? TReturn
    : never;

interface OnDemandObservableArray<T> extends Array<T> {}

function wrapArrayMethod<TKey extends keyof Array<any>>(
    name: TKey,
    isAccessor?: boolean,
) {
    (OnDemandObservableArray.prototype as any)[name] = function<TValue>(
        this: OnDemandObservableArray<TValue>,
        ...args: ArgsOf<Array<TValue>[TKey]>
    ): ReturnOf<Array<TValue>[TKey]> {
        if (isAccessor) {
            (this as any).ensureDecorated();
        }

        const toRet = Array.prototype[name].apply(this._internal, args);

        if (!isAccessor) {
            (this as any)._defineAccessorsIfNeeded();
        }

        return toRet;
    };
    Object.defineProperty(OnDemandObservableArray.prototype, name, {
        enumerable: false,
    });
}

// Writers
wrapArrayMethod('copyWithin');
wrapArrayMethod('fill');
wrapArrayMethod('pop');
wrapArrayMethod('push');
wrapArrayMethod('reverse');
wrapArrayMethod('shift');
wrapArrayMethod('sort');
wrapArrayMethod('splice');
wrapArrayMethod('unshift');

// Accessors
wrapArrayMethod('concat', true);
wrapArrayMethod('filter', true);
wrapArrayMethod('includes', true);
wrapArrayMethod('indexOf', true);
wrapArrayMethod('join', true);
wrapArrayMethod('lastIndexOf', true);
wrapArrayMethod('slice', true);
wrapArrayMethod('toString', true);
wrapArrayMethod('toLocaleString', true);

// Iterators
wrapArrayMethod('entries', true);
wrapArrayMethod('every', true);
wrapArrayMethod('find', true);
wrapArrayMethod('findIndex', true);
wrapArrayMethod('forEach', true);
wrapArrayMethod('keys', true);
wrapArrayMethod('map', true);
wrapArrayMethod('reduce', true);
wrapArrayMethod('reduceRight', true);
wrapArrayMethod('some', true);
wrapArrayMethod('values', true);

Object.defineProperty(
    OnDemandObservableArray.prototype,
    MobxLateInitWrappedSymbol,
    {
        get: () => true,
        enumerable: false,
    },
);

export default OnDemandObservableArray;
