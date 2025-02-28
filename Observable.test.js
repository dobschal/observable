const Observable = require("./Observable.js");

test("Observable contains correct value and subscriber is called when changes happen.", () => {
    const mockedSubscriber = jest.fn();
    const observable = Observable("test");
    observable.subscribe(mockedSubscriber);
    expect(observable.value).toBe("test");
    observable.value = "new test";
    expect(observable.value).toBe("new test");
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("Observable can be mapped to a new observable.", () => {
    const observable = Observable([1, 2, 3]);
    const mappedObservable = observable.map(value => value * 2);
    expect(mappedObservable.value.join("")).toBe([2, 4, 6].join(""));
    observable.value = [4, 5, 6];
    expect(mappedObservable.value.join("")).toBe([8, 10, 12].join(""));
});

test("Pushing a value to an array in an observable triggers the subscriber.", () => {
    const observable = Observable([1, 2, 3]);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.push(4);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("The subscribe callback function gets the new value of the Observable.", () => {
    const observable = Observable(5);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value = 10;
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(mockedSubscriber).toHaveBeenCalledWith(10);
});

test("Changing a Date object in an observable triggers the subscriber.", () => {
    const observable = Observable(new Date("2020-01-01"));
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.setFullYear(2021);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("Unsubscribing a subscriber stops it from being called.", () => {
    const observable = Observable(5);
    const mockedSubscriber = jest.fn();
    const unsubscribe = observable.subscribe(mockedSubscriber);
    unsubscribe();
    observable.value = 10;
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("Observing an HTMLElement works.", () => {
    const observable = Observable(document.createElement("div"));
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.setAttribute("id", "test");
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("Non-deep observables support any type.", () => {
    const observable = Observable(Promise, false);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value = "test";
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("Deep observables throw an error if the type isn't supported.", () => {
    expect(() => {
        const observable = Observable(Promise);
        const mockedSubscriber = jest.fn();
        observable.subscribe(mockedSubscriber);
        observable.value = "test";
    }).toThrow("Observable does not support type: function");
});

test("Non-deep observables subscriber isn't called if property changes.", () => {
    const observable = Observable(document.createElement("div"), false);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.setAttribute("id", "test");
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("Deep observables subscriber is called if property changes.", () => {
    const observable = Observable(document.createElement("div"));
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.setAttribute("id", "test");
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("Pushing a value to an array in an observable triggers the subscriber with the whole array.", () => {
    const array  = [1, 2, 3];
    const observable = Observable(array);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.push(4);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(mockedSubscriber).toHaveBeenCalledWith(array);
});
