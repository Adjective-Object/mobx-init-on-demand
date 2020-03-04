import { MobxLateInitInnerSymbol } from './constants';

export abstract class OnDemandObservable<TWrapped> {
    [MobxLateInitInnerSymbol]: TWrapped;
    abstract ensureWrapped(): void;
    _onAfterNonAcessorMethod(): void {}
}

// hide _inner on the object
Object.defineProperty(OnDemandObservable.prototype, MobxLateInitInnerSymbol, {
    enumerable: false,
    // allow rewriting of the property so that it can be redefined by mobx
    // when we lazily wrap it.
    configurable: true,
    // allow writing of the property so it can be initialized in the constructor of
    // each object.
    writable: true,
});
