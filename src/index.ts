import { setObservableWrapper } from './wrapWithDI';
import { wrapAsOnDemandObservable } from './wrapAsOnDemandObservable';
setObservableWrapper(wrapAsOnDemandObservable);

export { OnDemandObservableObject } from './OnDemandObservableObject';
export { OnDemandObservableArray } from './OnDemandObservableArray';
export { OnDemandObservableMap } from './OnDemandObservableMap';
export { wrapAsOnDemandObservable as observableOnDemand } from './wrapAsOnDemandObservable';
