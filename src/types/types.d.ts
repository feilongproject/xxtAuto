export { };

declare global {
    interface Buffer {
        json: <T>() => T;
    }
}