const Computed = require("./Computed.js");
const Observable = require("./Observable.js");

test("Computed returns value of function passed to Computed", () => {
    const computed = Computed(() => 5);
    expect(computed.value).toBe(5);
});

test("Computed watches observables in the function passed to Computed", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 5);
    expect(computed.value).toBe(10);
    observable.value = 10;
    expect(computed.value).toBe(15);
});

test("The observablesCalled array is reset after the Computed function is called", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 5);
    expect(computed.value).toBe(10);
    expect(Observable.observablesCalled).toBeUndefined();
});

test("Chaining Computed functions should work", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 5);
    const computed2 = Computed(() => computed.value + 5);
    expect(computed2.value).toBe(15);
    observable.value = 10;
    expect(computed2.value).toBe(20);
});

test("Two Computed function initialised at the same time are independent from each other", () => {
    const observable = Observable(5);
    const observable2 = Observable("A");
    const computed = Computed(() => observable.value + 5);
    const computed2 = Computed(() => observable2.value + "B");
    expect(computed.value).toBe(10);
    expect(computed2.value).toBe("AB");
    const mockedSubscriber = jest.fn();
    const mockedSubscriber2 = jest.fn();
    computed.subscribe(mockedSubscriber);
    computed2.subscribe(mockedSubscriber2);
    observable.value = 10;
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(mockedSubscriber2).toHaveBeenCalledTimes(1);
});

test("Subscribing a Computed function is the same as subscribing the observable it is watching", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 5);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    observable.value = 10;
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("The subscribe callback function gets the new value of the Computed function", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 5);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    observable.value = 10;
    expect(mockedSubscriber).toHaveBeenCalledWith(15);
});

test("Unsubscribing a subscriber stops it from being called", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 5);
    const mockedSubscriber = jest.fn();
    const unsubscribe = computed.subscribe(mockedSubscriber);
    unsubscribe();
    observable.value = 10;
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("The value of a Computeds function cannot be set", () => {
    const computed = Computed(() => 5);
    expect(() => { computed.value = 10; }).toThrow();
});

test("Non-deep computed is not affected by changes to the observables properties", () => {
    const observable = Observable({ a: 5 }, true);
    const computed = Computed(() => observable.value, false);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value.a).toBe(5);
    computed.value.a = 10;
    expect(computed.value.a).toBe(10);
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("Non-deep observable property change is not detected but value reflects mutation", () => {
    const observable = Observable({ a: 5 }, false);
    const computed = Computed(() => observable.value, true);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value.a).toBe(5);
    observable.value.a = 10;
    expect(computed.value.a).toBe(10);
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("Deep computed subscriber is called when computed value property changes directly", () => {
    const observable = Observable({ a: 5 }, false);
    const computed = Computed(() => observable.value, true);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value.a).toBe(5);
    computed.value.a = 10;
    expect(computed.value.a).toBe(10);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("Deep computed subscriber is called when deep observable property changes", () => {
    const observable = Observable({ a: 5 }, true);
    const computed = Computed(() => observable.value, true);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value.a).toBe(5);
    observable.value.a = 10;
    expect(computed.value.a).toBe(10);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("Recorder is cleaned up even if the computed function throws", () => {
    expect(() => {
        Computed(() => { throw new Error("test error"); });
    }).toThrow("test error");
    expect(Observable.observablesCalled).toBeUndefined();
    expect(Observable.recorders).toBeUndefined();
    // Computed still works after the error
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 1);
    expect(computed.value).toBe(6);
});

test("Computed depending on multiple observables updates when any of them changes.", () => {
    const a = Observable(2);
    const b = Observable(3);
    const computed = Computed(() => a.value + b.value);
    expect(computed.value).toBe(5);
    a.value = 10;
    expect(computed.value).toBe(13);
    b.value = 20;
    expect(computed.value).toBe(30);
});

test("Computed unsubscribe() method removes the listener.", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 1);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    computed.unsubscribe(mockedSubscriber);
    observable.value = 10;
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("isObservable property is true on Computed.", () => {
    const computed = Computed(() => 5);
    expect(computed.isObservable).toBe(true);
});

test("Disposing a Computed stops it from updating when dependencies change.", () => {
    const observable = Observable(5);
    const computed = Computed(() => observable.value + 1);
    expect(computed.value).toBe(6);
    computed.dispose();
    observable.value = 10;
    expect(computed.value).toBe(6);
});

test("Have two computed arrays --> subscriber is called only once", () => {
    const entries = Observable([{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}], true);
    const categories = Observable([{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}], true);
    const filter = Observable({ yeah: true, name: "fake"}, true);

    function getCategories() {
        return categories.value.map(c => {
            return {
                value: c.value,
                name: filter.value.name
            };
        });
    }

    function getEntries() {
        const categories = getCategories();
        return entries.value.map(e => {
            return {
                value: e.value,
                categories: categories.find(c => c.value === e.value),
                name: filter.value.name
            };
        });
    }

    const computed = Computed(() => {
        return getEntries().map(e => e.name);
    });

    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value[0]).toBe("fake");
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

