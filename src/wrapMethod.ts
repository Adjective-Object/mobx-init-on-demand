import { OnDemandObservable } from './OnDemandObservable';
import { MobxLateInitInnerSymbol } from './constants';

type ArgsOf<TFunc> = TFunc extends (...args: infer TArgs) => any
    ? TArgs
    : never;
type ReturnOf<TFunc> = TFunc extends (...args: any[]) => infer TReturn
    ? TReturn
    : never;
export type FunctionKeys<TWrapped> = {
    [K in keyof TWrapped]: TWrapped[K] extends Function ? TWrapped[K] : never;
};

export function wrapMethod<
    TObservableClass extends OnDemandObservable<any>,
    TObservableClassProto extends typeof OnDemandObservable.prototype,
    TBaseClassProto extends {
        [key: string]: Function | any;
    },
    TKey extends keyof FunctionKeys<TBaseClassProto> &
        keyof FunctionKeys<TObservableClassProto>
>(
    ObservableClassPrototype: TObservableClassProto,
    BaseClassPrototype: TBaseClassProto,
    name: TKey,
    isAccessor?: boolean,
) {
    (ObservableClassPrototype[name] as any) = function(
        this: TObservableClass,
        ...args: ArgsOf<TBaseClassProto[TKey]>
    ): ReturnOf<TBaseClassProto[TKey]> {
        if (isAccessor) {
            (this as any).ensureWrapped();
        }

        // Reference the actual instance's base class prototype,
        // since not all mobx wrapped classes can have their equivalent
        // class methods called on them (e.g. ObservableMap is not a Map)
        const proto =
            Object.getPrototypeOf(this[MobxLateInitInnerSymbol]) ||
            BaseClassPrototype;
        const toRet = proto[name].apply(this[MobxLateInitInnerSymbol], args);

        if (!isAccessor) {
            this._onAfterNonAcessorMethod();
        }

        return toRet;
    };
    Object.defineProperty(ObservableClassPrototype, name, {
        enumerable: false,
    });
}
