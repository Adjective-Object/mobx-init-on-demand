import { MobxLateInitObservableObject } from './MobxLateInitObservableObject';

export const observableOnDemand = <T extends object>(o: T): T =>
    new MobxLateInitObservableObject(o) as T;
