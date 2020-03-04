import { ObservableMap, isObservableMap, isObservable, observable } from 'mobx';
import { OnDemandObservable } from './OnDemandObservable';
import { MobxLateInitInnerSymbol } from './constants';
import { wrapMethod } from './wrapMethod';
import { wrapObservable } from './wrapWithDI';

class _OnDemandObservableMap<K = any, V = any> extends OnDemandObservable<
    Map<K, V> | ObservableMap<K, V>
> {
    // Trick mobx internals into treating this map as a mobx map
    constructor(initialObject?: Record<any, V> | Map<K, V>) {
        super();
        this[MobxLateInitInnerSymbol] = initialObject
            ? initialObject instanceof Map || isObservableMap(initialObject)
                ? initialObject
                : new Map(Object.entries(initialObject))
            : new Map();
    }

    public set(k: K, v: V): this {
        this[MobxLateInitInnerSymbol].set(k, wrapObservable(v));
        return this;
    }

    public get size(): number {
        this.ensureWrapped();
        return this[MobxLateInitInnerSymbol].size;
    }

    public forEach(cb: (v: V, k: K, map: Map<K, V>) => void): void {
        this.ensureWrapped();
        return this[MobxLateInitInnerSymbol].forEach((v, k) => {
            cb(v, k, this as any);
        });
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    ensureWrapped() {
        if (!isObservable(this[MobxLateInitInnerSymbol])) {
            this[MobxLateInitInnerSymbol] = observable.map(
                this[MobxLateInitInnerSymbol],
                {
                    deep: false,
                },
            );
        }
    }
}

type MapAnyProto = typeof Map.prototype;
type OnDemandObservableMapProto = typeof _OnDemandObservableMap.prototype;
const wrapMapMethod = <TKey extends keyof MapAnyProto>(
    name: TKey,
    isAccessor?: boolean,
) =>
    wrapMethod<
        _OnDemandObservableMap<unknown, unknown>,
        OnDemandObservableMapProto,
        MapAnyProto,
        TKey
    >(_OnDemandObservableMap.prototype, Map.prototype, name, isAccessor);

interface _OnDemandObservableMap<K, V> extends Map<K, V> {}

// Trick mobx internals into treating this as an observable map
Object.defineProperty(_OnDemandObservableMap.prototype, 'isMobXObservableMap', {
    enumerable: false,
    get: () => true,
});

// Map accessor methods
wrapMapMethod('entries', true);
wrapMapMethod('keys', true);
wrapMapMethod('values', true);
wrapMapMethod('get', true);
wrapMapMethod('has', true);

// Map writer methods
wrapMapMethod('delete');

export const OnDemandObservableMap = _OnDemandObservableMap;
export type OnDemandObservableMap<K, V> = _OnDemandObservableMap<K, V>;
