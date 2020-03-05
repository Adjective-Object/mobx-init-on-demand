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

    abstract _wrap(): void;

    _ensureWrapped(): void {
        if (!this[MobxLateInitWrittenSymbol]) {
            this[MobxLateInitWrittenSymbol] = true;
            if (process.env.NODE_ENV !== 'production') {
                onOnDemandObservableWrapped(this);
            }
            this._wrap();
        }
    }
    _onAfterNonAcessorMethod(): void {}
}

// hide _inner on the object
const allowWritable = { writable: true };
Object.defineProperty(
    OnDemandObservable.prototype,
    MobxLateInitInnerSymbol,
    // allow writing of the property so it can be initialized in the constructor of
    // each object.
    allowWritable,
);

Object.defineProperty(
    OnDemandObservable.prototype,
    MobxLateInitWrittenSymbol,
    // allow writing of the property so it can be overwritten when the inner data
    // structure is marked as wrapped
    allowWritable,
);
