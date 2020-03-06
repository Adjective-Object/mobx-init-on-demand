import {
    observable,
    ObservableSet,
    isObservableMap,
    isObservableArray,
    isObservableSet,
} from 'mobx';
import { OnDemandObservableMap } from './OnDemandObservableMap';
import { OnDemandObservableObject } from './OnDemandObservableObject';
import { OnDemandObservableArray } from './OnDemandObservableArray';
import { isObject } from './isObject';

export function wrapAsOnDemandObservable<K, V>(
    x: Map<K, V> | OnDemandObservableMap<K, V>,
): OnDemandObservableMap<K, V>;
export function wrapAsOnDemandObservable<T>(x: Set<T>): ObservableSet<T>;
export function wrapAsOnDemandObservable<T>(
    x: Array<T>,
): OnDemandObservableArray<T>;
export function wrapAsOnDemandObservable<T extends object>(x: T): T;

export function wrapAsOnDemandObservable(x: any) {
    if (Array.isArray(x) || isObservableArray(x)) {
        return new OnDemandObservableArray(x);
    } else if (x instanceof Set || isObservableSet(x)) {
        return observable.set(x);
    } else if (x instanceof Map || isObservableMap(x)) {
        return new OnDemandObservableMap(x);
    } else if (isObject(x)) {
        return OnDemandObservableObject.wrap(x);
    } else {
        return x;
    }
}
