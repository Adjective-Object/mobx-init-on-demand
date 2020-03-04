import { observable, decorate, transaction, isObservable } from 'mobx';
import { isOnDemandObservable } from './isOnDemandObservable';
import { wrapObservable } from './wrapWithDI';
import { wrapMethod, FunctionKeys } from './wrapMethod';
import { OnDemandObservable } from './OnDemandObservable';
import { MobxLateInitInnerSymbol } from './constants';

export function isObject(value: any): value is object {
    return value !== null && typeof value === 'object';
}

/**
 * Wraps a shallow mobx observable object and initializes only those
 * properties
 *
 * Properties with scalar values are stored on the actual ._inner object.
 *
 * When first read, properties with non-scalar values are put in the _wrappedInternal map,
 * and wrapped in another MobxLateInitObservableObject
 */
class _OnDemandObservableArray<T> extends OnDemandObservable<Array<T>>
    implements Array<T> {
    /**
     * Used to track if we need to define new accessors when
     * the underlying array changes.
     */
    _maxLength: number = 0;

    constructor(wrappedObject: Array<T>) {
        super();
        this[MobxLateInitInnerSymbol] = wrappedObject;
        this._defineAccessorsIfNeeded();
        // hide _maxLength on array
        Object.defineProperty(this, '_maxLength', {
            enumerable: false,
        });
    }

    /**
     * Called after a wrapped non-accessor method is called.
     */
    _onAfterNonAcessorMethod() {
        this._defineAccessorsIfNeeded();
    }

    private _defineAccessorsIfNeeded() {
        if (this[MobxLateInitInnerSymbol].length > this._maxLength) {
            for (
                let i = this[MobxLateInitInnerSymbol].length - 1;
                i >= this._maxLength;
                i--
            ) {
                Object.defineProperty(this, i, {
                    get: this._readProperty.bind(this, i),
                    set: this._writeProperty.bind(this, i),
                    enumerable: true,
                    // make it configurable so we can delete it later
                    configurable: true,
                });
            }
            this._maxLength = this[MobxLateInitInnerSymbol].length;
        } else if (this[MobxLateInitInnerSymbol].length < this._maxLength) {
            for (
                let i = this[MobxLateInitInnerSymbol].length;
                i < this._maxLength;
                i++
            ) {
                delete this[i];
            }
            this._maxLength = this[MobxLateInitInnerSymbol].length;
        }
    }

    private _readProperty(index: number) {
        this.ensureWrapped();

        const readProp = this[MobxLateInitInnerSymbol][index];

        // If the value is stored as a scalar, just return it
        if (!isObject(readProp)) {
            return readProp;
        }

        // If the object is not wrapped yet, wrap it.
        if (!isOnDemandObservable(readProp)) {
            this[MobxLateInitInnerSymbol][index] = wrapObservable(
                this[MobxLateInitInnerSymbol][index],
            );
        }

        return this[MobxLateInitInnerSymbol][index];
    }

    private _writeProperty(index: number, newValue: T) {
        // Perform in a transaction so any observers triggered by clearing observable values
        // read back updated values first.
        transaction(() => {
            if (!isObject(newValue)) {
                // we are writing a scalar
                this[MobxLateInitInnerSymbol][index] = newValue;
                return;
            }

            // we are writing an object
            this[MobxLateInitInnerSymbol][index] = isOnDemandObservable(
                newValue,
            )
                ? newValue
                : (wrapObservable(newValue) as any);
        });
    }

    ensureWrapped() {
        if (isObservable(this[MobxLateInitInnerSymbol])) {
            return;
        }

        this[MobxLateInitInnerSymbol] = observable(
            this[MobxLateInitInnerSymbol],
            {
                deep: false,
            },
        );
    }

    [Symbol.iterator]() {
        this.ensureWrapped();
        return this[MobxLateInitInnerSymbol][Symbol.iterator]();
    }
}

type ArrayAnyProto = typeof Array.prototype;
type OnDemandObservableArrayProto = typeof _OnDemandObservableArray.prototype;
const wrapArrayMethod = <TKey extends keyof ArrayAnyProto>(
    name: TKey,
    isAccessor?: boolean,
) =>
    wrapMethod<
        _OnDemandObservableArray<unknown>,
        OnDemandObservableArrayProto,
        ArrayAnyProto,
        TKey
    >(_OnDemandObservableArray.prototype, Array.prototype, name, isAccessor);

interface _OnDemandObservableArray<T> extends Array<T> {}

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

export const OnDemandObservableArray = _OnDemandObservableArray;
export type OnDemandObservableArray<T> = _OnDemandObservableArray<T>;
