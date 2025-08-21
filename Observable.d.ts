interface ObservableVariable<T> {
    isObservable: boolean;
    value: T;
    set(value: T): void;
    subscribe(callback: (value: T) => void | Promise<void>): void;
    unsubscribe(callback: (value: T) => void | Promise<void>): void;
    map<U>(callback: (value: T) => U): ObservableVariable<U>;
}

export default function Observable<T>(initialValue: T, deep?: boolean): ObservableVariable<T>;
