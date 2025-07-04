// direct export of an object literal for property extraction tests
export default {
    str: 'abc',
    num: 123,
    greet(s: string): string {
        return 'Hello ' + s;
    }
};