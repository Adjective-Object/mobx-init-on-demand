import { MobxLateInitInnerSymbol } from './constants';

export function isOnDemandObservable(value: object) {
    return !!Reflect.get(value, MobxLateInitInnerSymbol);
}
