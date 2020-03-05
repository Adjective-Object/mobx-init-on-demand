import {
    MobxLateInitInnerSymbol,
    MobxLateInitWrittenSymbol,
} from './constants';
import {
    onOnDemandObservableCreated,
    onOnDemandObservableWrapped,
} from './DevTools';

export abstract class OnDemandObservable<TWrapped> {
    [MobxLateInitInnerSymbol]: TWrapped;
    /**
     * If this observable has been wrapped or not.
     */
    [MobxLateInitWrittenSymbol]: boolean = false;

    constructor() {
        if (process.env.NODE_ENV !== 'production') {
            onOnDemandObservableCreated(this);
        }
    }

    abstract wrap(): void;

    ensureWrapped(): void {
        if (!this[MobxLateInitWrittenSymbol]) {
            this[MobxLateInitWrittenSymbol] = true;
            if (process.env.NODE_ENV !== 'production') {
                onOnDemandObservableWrapped(this);
            }
            this.wrap();
        }
    }
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

Object.defineProperty(OnDemandObservable.prototype, MobxLateInitWrittenSymbol, {
    enumerable: false,
    // allow writing of the property so it can be initialized in the constructor of
    // each object.
    writable: true,
});
