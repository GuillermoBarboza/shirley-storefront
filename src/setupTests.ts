// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// react-router v7 reaches for TextEncoder/TextDecoder at import time, and the
// jsdom bundled with CRA 5's jest 27 predates them being global. Node has had
// both for years, so borrow them rather than pulling in a polyfill package.
import { TextEncoder, TextDecoder } from "util";

const globals = global as unknown as Record<string, unknown>;
if (!globals.TextEncoder) globals.TextEncoder = TextEncoder;
if (!globals.TextDecoder) globals.TextDecoder = TextDecoder;
