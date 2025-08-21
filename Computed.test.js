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

test("Non-deep computed is not affected by changes to the observables properties", () => {
    const observable = Observable({ a: 5 }, false);
    const computed = Computed(() => observable.value, true);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value.a).toBe(5);
    observable.value.a = 10;
    expect(computed.value.a).toBe(10);
    expect(mockedSubscriber).toHaveBeenCalledTimes(1);
});

test("deep computed is affected by changes to the observables properties", () => {
    const observable = Observable({ a: 5 }, false);
    const computed = Computed(() => observable.value, true);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value.a).toBe(5);
    computed.value.a = 10;
    expect(computed.value.a).toBe(10);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("deep computed is affected by changes to the observables properties", () => {
    const observable = Observable({ a: 5 }, true);
    const computed = Computed(() => observable.value, true);
    const mockedSubscriber = jest.fn();
    computed.subscribe(mockedSubscriber);
    expect(computed.value.a).toBe(5);
    observable.value.a = 10;
    expect(computed.value.a).toBe(10);
    expect(mockedSubscriber).toHaveBeenCalledTimes(2);
});

test("A computed function with a loop referencing an Observable should not cause an infinite loop", () => {
    const config = Observable({
        showItems: true,
        bla: 1
    });
    const items1 = Observable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const items2 = Observable([1, 2, 3, 4]);
    const computed = Computed(() => {
        return items1.value.filter(i => {
            return config.value.showItems && items2.value.includes(i);
        }).map(i => {

            return i * config.value.bla;
        });
    });
    const computedOfComputed = Computed(() => {
        return computed.value.map(i => i * 2).filter(v => v > 1 && config.value.showItems);
    });
    const mockedSubscriber1 = jest.fn();
    const mockedSubscriber2 = jest.fn();
    const mockedSubscriber3 = jest.fn();
    const mockedSubscriber4 = jest.fn();
    items1.subscribe(mockedSubscriber1);
    items2.subscribe(mockedSubscriber2);
    computed.subscribe(mockedSubscriber3);
    computedOfComputed.subscribe(mockedSubscriber4);
    expect(computed.value).toEqual([1, 2, 3, 4]);
    expect(computedOfComputed.value).toEqual([2, 4, 6, 8]);
    items2.value.push(5);
    expect(computed.value).toEqual([1, 2, 3, 4, 5]);
    expect(computedOfComputed.value).toEqual([2, 4, 6, 8, 10]);
    expect(mockedSubscriber1).toHaveBeenCalledTimes(1);
    expect(mockedSubscriber2).toHaveBeenCalledTimes(2);
    expect(mockedSubscriber3).toHaveBeenCalledTimes(2);
    expect(mockedSubscriber4).toHaveBeenCalledTimes(2);
});

test("Have two computed arrays --> subscriber is called only once", () => {
    const entries = Observable([{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}], true);
    const categories = Observable([{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}], true);
    const filter = Observable({ yeah: true, name: "fake"}, true);

    function getCategories() {
        return categories.value.map(c => {
            return {
                value: c.value,
                name: filter.name
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

