const Observable = require("./Observable.js");

function Computed(fn, deep = false) {

    const observable = Observable(undefined, deep);
    const subscriptions = [];

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
        },
        dispose() {
            subscriptions.forEach(unsub => unsub());
        }
    };

    const update = () => {
        observable.value = fn();
    };

    const getCalledObservables = Observable.recordObservablesCalled();
    let dependencies;
    try {
        update();
    } finally {
        dependencies = getCalledObservables();
    }
    dependencies.forEach(dep => {
        subscriptions.push(dep.subscribe(update));
    });

    return computed;
}

module.exports = Computed;
