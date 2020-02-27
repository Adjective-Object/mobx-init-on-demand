import { MobxLateInitObservableObject } from './MobxLateInitObservableObject';

export const observableOnDemand = <T extends object>(o: T): T =>
    MobxLateInitObservableObject.wrap(o);
