// react-use-keypress ships no types. Signature taken from its lib/index.cjs.js.
declare module "react-use-keypress" {
    export default function useKeypress(
        keys: string | string[],
        handler: (event: KeyboardEvent) => void
    ): void;
}
