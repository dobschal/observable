const Observable = require("./Observable.js");

function Computed(fn, deep = false) {

    const observable = Observable(undefined, deep);

    const computed = {
        isObservable: true,
        get value() {
            if(Array.isArray(Observable.observablesCalled)) {
                Observable.observablesCalled.push(observable);
            }
            return observable.value;
        },
        set value(_) {
            throw new Error("Computed value cannot be set.");
        },
        subscribe(listener) {
            return observable.subscribe(listener);
        },
        unsubscribe(listener) {
            observable.unsubscribe(listener);
        }
    };

    const update = () => {
        observable.value = fn();
    };

    const getCalledObservables = Observable.recordObservablesCalled();
    update();
    const dependencies = getCalledObservables();
    dependencies.forEach(observable => {
        observable.subscribe(update);
    });

    return computed;
}

module.exports = Computed;
