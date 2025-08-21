
interface ComputedValue<T> {
    value: T;
    subscribe(callback: (value: any) => void | Promise<void>): void;
    unsubscribe(callback: (value: any) => void | Promise<void>): void;
    isObservable: boolean;
}

export default function Computed<T>(fn: () => T, deep?: boolean): ComputedValue<T>;
