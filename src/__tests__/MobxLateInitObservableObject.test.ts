import { MobxLateInitObservableObject } from '../MobxLateInitObservableObject';
import { autorun, spy } from 'mobx';

describe('MobxLateInitObservableObject', () => {
    let disposer: () => void;
    afterEach(() => {
        disposer && disposer();
    });

    it('reads the initial value correctly', () => {
        const wrappedObservable = MobxLateInitObservableObject.wrap({
            a: '1',
        });

        expect(wrappedObservable.a).toEqual('1');
    });

    it('reads updated values', () => {
        const wrappedObservable = MobxLateInitObservableObject.wrap({
            a: '1',
        });

        wrappedObservable.a = '2';

        expect(wrappedObservable.a).toEqual('2');
    });

    it('Listeners to props on the wrapped object are triggered on overwrite', () => {
        // Arrange
        spy(e => console.log(e));

        const wrappedObservable = MobxLateInitObservableObject.wrap({
            a: '1',
        });

        const observedValues: string[] = [];
        disposer = autorun(() => {
            observedValues.push(wrappedObservable.a);
        });

        // Act
        wrappedObservable.a = '2';

        // Assert
        expect(observedValues).toEqual(['1', '2']);
    });
});
