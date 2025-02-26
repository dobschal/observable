function Observable(initialValue) {
    const listeners = new Set();
    let value;

    function _observePlainObject(listeners, newValue) {
        value = new Proxy(newValue, {
            set(target, property, newPropertyValue) {
                if (target[property] !== newPropertyValue) {
                    target[property] = newPropertyValue;
                    listeners.forEach(listener => listener(target));
                }
                return true;
            }
        });
    }

    function _observeObjectModifiers(listeners, newValue, methodNames) {
        value = newValue;
        for (const method of methodNames) {
            newValue[method] = function (...args) {
                const retVal = Object.getPrototypeOf(newValue)[method].apply(this, args);
                listeners.forEach((callback) => callback(retVal));
                return retVal;
            };
        }
    }

    function _setValue(newValue) {
        if (value !== newValue) {
            if (newValue?.constructor === Object) { // isPlainObject
                _observePlainObject(listeners, newValue);
            } else if (Array.isArray(newValue)) { // isArray
                _observeObjectModifiers(listeners, newValue, ["push", "sort", "unshift", "pop", "shift", "splice", "reverse"]);
            } else if (newValue instanceof Date) { // isDate
                _observeObjectModifiers(listeners, newValue, ["setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds", "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", "setUTCMonth", "setUTCSeconds"]);
            } else if(newValue instanceof HTMLElement) {
                _observeObjectModifiers(listeners, newValue, ["appendChild", "remove", "replaceWith", "setAttribute", "removeAttribute"]);
            } else if (newValue !== Object(newValue)) { // isPrimitive
                value = newValue;
            } else {
                throw new Error("Observable does not support type: " + typeof newValue);
            }
            listeners.forEach(listener => listener(value));
        }
    }

    _setValue(initialValue);

    return {
        isObservable: true,
        get value() {
            if(Array.isArray(Observable.observablesCalled)) {
                Observable.observablesCalled.push(this);
            }
            return value;
        },
        set value(newValue) {
            _setValue(newValue);
        },
        set(newValue) {
            _setValue(newValue);
        },
        subscribe(listener) {
            listeners.add(listener);
            listener(value);
            return () => listeners.delete(listener);
        },
        unsubscribe(listener) {
            listeners.delete(listener);
        },
        map(mapFunction) {
            const newObservable = Observable();
            this.subscribe((unwrappedValue) => {
                if (Array.isArray(unwrappedValue)) {
                    newObservable.value = unwrappedValue.map(mapFunction);
                } else {
                    newObservable.value = mapFunction(unwrappedValue);
                }
            });
            return newObservable;
        }
    };
}

// Returns a function that can be called to get the observables
// that were called during the recording.
Observable.recordObservablesCalled = function() {
    Observable.recorders = Observable.recorders || 0;
    Observable.recorders++;
    Observable.observablesCalled = Observable.observablesCalled || [];
    const currentIndex = Observable.observablesCalled.length;
    return function() {
        const observables = Observable.observablesCalled.slice(currentIndex);
        Observable.recorders--;
        if (Observable.recorders === 0) {
            delete Observable.recorders;
            delete Observable.observablesCalled;
        }
        return observables;
    };
};

module.exports = Observable;
