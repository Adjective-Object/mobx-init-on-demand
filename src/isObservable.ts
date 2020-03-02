import { isObservable, ObservableMap } from 'mobx';
import { OnDemandObservableMap } from './OnDemandObservableMap';

export const isObservableMapWrapped = (
    x: any,
): x is ObservableMap | OnDemandObservableMap => {
    return isObservable(x) || x instanceof OnDemandObservableMap;
};
