/**
 * Key that the wrapped data is stored under in an on demand observable
 */
export const MobxLateInitInnerSymbol = Symbol('mlioo._i');
/**
 * Key that the wrapped status for the data under MobxLateInitInnerSymbol
 * is stored under in an on demand observable.
 *
 * (e.g. if it is true, it will log.)
 */
export const MobxLateInitWrittenSymbol = Symbol('mlioo._w');
