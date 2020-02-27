import { observable, decorate, toJS, transaction } from 'mobx';

function isObject(value: any): value is object {
    return value !== null && typeof value === 'object';
}

// type of decorators in `mobx.decorate(foo, decorators)`
type MobxDecorator =
    | MethodDecorator
    | PropertyDecorator
    | Array<MethodDecorator>
    | Array<PropertyDecorator>;

const UninitializedObjectSymbol = Symbol('mlioo.no-object');

type InitializedSubObjects<T extends object> = {
    [K in keyof T]: T[K] extends object
        ? MobxLateInitObservableObject<T[K]> | typeof UninitializedObjectSymbol
        : typeof UninitializedObjectSymbol;
};

type PartialDecoratorMap<T extends object> = Partial<
    {
        [K in keyof T]: MobxDecorator;
    }
>;

/**
 * Wraps a shallow mobx observable object and initializes only those
 * properties
 *
 * Properties with scalar values are stored on the actual ._internal object.
 *
 * When first read, properties with non-scalar values are put in the _wrappedInternal map,
 * and wrapped in another MobxLateInitObservableObject
 */
export class MobxLateInitObservableObject<T extends object> {
    /**
     * Scalar values are stored here
     */
    private _scalarsAndUninitializedSubObjects: any;
    /**
     * Objects are stored here, and wrapped again ian a MobxLateInitObservableObject
     */
    @observable.shallow _initializedSubObjects: InitializedSubObjects<T>;

    static wrap<T extends object>(wrappedObject: T): T {
        const wrapped = new MobxLateInitObservableObject(wrappedObject);
        const proxyObject = {};

        for (let _key of Reflect.ownKeys(wrappedObject)) {
            const key = _key as keyof T;
            // define accessors on this object that proxy property reads
            Object.defineProperty(proxyObject, key, {
                get: wrapped._readProperty.bind(wrapped, key),
                set: wrapped._writeProperty.bind(wrapped, key),
                enumerable: true,
            });
        }

        return proxyObject as T;
    }

    private constructor(wrappedObject: T) {
        const scalarDecorators: PartialDecoratorMap<T> = {};
        const emptySubObject: Partial<
            { [K in keyof T]: typeof UninitializedObjectSymbol }
        > = {};
        for (let _key of Reflect.ownKeys(wrappedObject)) {
            const key = _key as keyof T;
            // make all scalar keys of the wrapped object observable
            if (!isObject(wrappedObject[key])) {
                scalarDecorators[key] = observable;
            }
            // make the subobject fully observable
            emptySubObject[key] = UninitializedObjectSymbol;
        }

        this._scalarsAndUninitializedSubObjects = decorate(
            // Create a shallow copy of the object when decorating it,
            // so we don't mutate the original object during initialization
            { ...wrappedObject },
            scalarDecorators,
        );

        this._initializedSubObjects = emptySubObject as InitializedSubObjects<
            T
        >;
    }

    private _readProperty(propertyName: keyof T) {
        // If the value is stored as a scalar
        if (
            this._initializedSubObjects[propertyName] ===
            UninitializedObjectSymbol
        ) {
            if (
                !isObject(this._scalarsAndUninitializedSubObjects[propertyName])
            ) {
                return this._scalarsAndUninitializedSubObjects[propertyName];
            }

            this._initializedSubObjects[
                propertyName
            ] = MobxLateInitObservableObject.wrap(
                this._scalarsAndUninitializedSubObjects[propertyName],
            );
        }

        return this._initializedSubObjects[propertyName];
    }

    private _writeProperty<TKey extends keyof T>(
        propertyName: TKey,
        newValue: any,
    ) {
        // Perform in a transaction so any observers triggered by clearing observable values
        // read back updated values first.
        transaction(() => {
            if (!isObject(newValue)) {
                // we are writing a scalar
                this._scalarsAndUninitializedSubObjects[
                    propertyName
                ] = newValue;
                // TODO I think this might be unsound? We need to trigger object observers
                // if it was read, I think?
                Reflect.set(
                    this._initializedSubObjects,
                    propertyName,
                    UninitializedObjectSymbol,
                );
                return;
            }

            // we are writing an object
            if (
                !isObject(
                    this._scalarsAndUninitializedSubObjects[propertyName],
                ) &&
                this._scalarsAndUninitializedSubObjects[propertyName] !==
                    undefined
            ) {
                // Unset the old value in the observable if it was a scalar.
                //
                // This is to trigger any listeners to the property so they will
                // re-call _readProperty and read the value off of the wrapped
                // internal that we set below.
                this._scalarsAndUninitializedSubObjects[
                    propertyName
                ] = undefined;
            }

            this._initializedSubObjects[
                propertyName
            ] = MobxLateInitObservableObject.wrap(newValue) as any;
        });
    }
}
