
interface ComputedValue<T> {
    value: T;
    subscribe(callback: (value: any) => void): void;
    unsubscribe(callback: (value: any) => void): void;
}

export default function Computed<T>(fn: () => T, deep?: boolean): ComputedValue<T>;
