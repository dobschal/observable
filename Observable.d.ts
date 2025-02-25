interface ObservableVariable<T> {
    value: T;
    set(value: T): void;
    subscribe(callback: (value: T) => void): void;
    unsubscribe(callback: (value: T) => void): void;
    map(callback: (value: any) => any): ObservableVariable<any>;
}

export default function Observable<T>(initialValue: T): ObservableVariable<T>;
