import { ObservableMap, isObservableMap, isObservable, observable } from 'mobx';
import { wrapObservable } from './wrapWithDI';

export class OnDemandObservableMap<K = any, V = any> {
    private _inner: Map<K, V> | ObservableMap<K, V>;
    // Trick mobx internals into treating this map as a mobx map
    constructor(initialObject?: Record<any, V> | Map<K, V>) {
        this._inner = initialObject
            ? initialObject instanceof Map || isObservableMap(initialObject)
                ? initialObject
                : new Map(Object.entries(initialObject))
            : new Map();
    }

    public get(k: K): V | undefined {
        this.ensureWrapped();

        return this._inner.get(k);
    }

    public set(k: K, v: V): this {
        this._inner.set(k, wrapObservable(v));
        return this;
    }

    public has(k: K): boolean {
        this.ensureWrapped();
        return this._inner.has(k);
    }

    public entries(): IterableIterator<[K, V]> {
        this.ensureWrapped();
        return this._inner.entries();
    }

    public delete(k: K): boolean {
        this.ensureWrapped();
        return this._inner.delete(k);
    }

    private ensureWrapped() {
        if (!isObservable(this._inner)) {
            this._inner = observable.map(this._inner, {
                deep: false,
            });
        }
    }

    // TODO iteration
}

// Trick mobx internals into treating this as an observable map
(OnDemandObservableMap.prototype as any).isMobXObservableMap = true;