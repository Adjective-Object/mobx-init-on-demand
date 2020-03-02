import { MobxLateInitWrappedSymbol } from './constants';

export function isOnDemandObservable(value: object) {
    return !!Reflect.get(value, MobxLateInitWrappedSymbol);
}
