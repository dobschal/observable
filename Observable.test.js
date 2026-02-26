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
    expect(mockedSubscriber).toHaveBeenCalledWith(expect.arrayContaining([1, 2, 3, 4]));
});

test("Observing an array does not mutate the original array's methods.", () => {
    const array = [1, 2, 3];
    const originalPush = array.push;
    Observable(array);
    expect(array.push).toBe(originalPush);
});

test("Direct index assignment on a deep array observable triggers the subscriber.", () => {
    const observable = Observable([1, 2, 3]);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value[0] = 99;
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(observable.value[0]).toBe(99);
});

test("Setting the same primitive value does not trigger the subscriber again.", () => {
    const observable = Observable(5);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value = 5;
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("Multiple subscribers are all called when value changes.", () => {
    const observable = Observable(1);
    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();
    observable.subscribe(subscriber1);
    observable.subscribe(subscriber2);
    observable.value = 2;
    expect(subscriber1).toHaveBeenCalledTimes(2);
    expect(subscriber2).toHaveBeenCalledTimes(2);
});

test("The set() method works like the value setter.", () => {
    const observable = Observable(1);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.set(2);
    expect(observable.value).toBe(2);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(mockedSubscriber).toHaveBeenCalledWith(2);
});

test("The unsubscribe() method removes a listener.", () => {
    const observable = Observable(1);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.unsubscribe(mockedSubscriber);
    observable.value = 2;
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("isObservable property is true.", () => {
    const observable = Observable(1);
    expect(observable.isObservable).toBe(true);
});

test("Deep plain object property change triggers the subscriber.", () => {
    const observable = Observable({ a: 1, b: 2 });
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.a = 10;
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(observable.value.a).toBe(10);
});

test("Setting the same property value on a deep object does not trigger the subscriber.", () => {
    const observable = Observable({ a: 1 });
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.a = 1;
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("map() works with non-array values.", () => {
    const observable = Observable(5);
    const mapped = observable.map(v => v * 2);
    expect(mapped.value).toBe(10);
    observable.value = 10;
    expect(mapped.value).toBe(20);
});

test("Array pop on a deep observable triggers the subscriber.", () => {
    const observable = Observable([1, 2, 3]);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.pop();
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(observable.value.length).toBe(2);
});

test("Array splice on a deep observable triggers the subscriber.", () => {
    const observable = Observable([1, 2, 3]);
    const mockedSubscriber = jest.fn();
    observable.subscribe(mockedSubscriber);
    observable.value.splice(1, 1);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
    expect(observable.value.length).toBe(2);
    expect(observable.value[1]).toBe(3);
});

test("Disposing a mapped observable stops it from updating.", () => {
    const observable = Observable([1, 2, 3]);
    const mapped = observable.map(v => v * 2);
    expect(mapped.value.join("")).toBe([2, 4, 6].join(""));
    mapped.dispose();
    observable.value = [4, 5, 6];
    expect(mapped.value.join("")).toBe([2, 4, 6].join(""));
});
