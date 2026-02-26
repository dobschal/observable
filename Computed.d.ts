
interface ComputedValue<T> {
    isObservable: true;
    value: T;
    subscribe(callback: (value: T) => void): () => void;
    unsubscribe(callback: (value: T) => void): void;
    dispose(): void;
}

export default function Computed<T>(fn: () => T, deep?: boolean): ComputedValue<T>;
