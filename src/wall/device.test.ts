import { classifyDevice } from "./device";

const ANDROID_CHROME =
    "Mozilla/5.0 (Linux; Android 14; moto g75 5G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const ANDROID_WHATSAPP =
    "Mozilla/5.0 (Linux; Android 14; moto g75 5G; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36 WhatsApp/2.24";
const IPHONE =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const WINDOWS =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

describe("classifyDevice", () => {
    it("AR-capable phone", () => {
        expect(classifyDevice({ userAgent: ANDROID_CHROME, coarsePointer: true, arSupported: true })).toBe("ar");
    });

    it("iPhone", () => {
        expect(classifyDevice({ userAgent: IPHONE, coarsePointer: true, arSupported: false })).toBe("iphone");
    });

    it("Android browser without AR (WhatsApp in-app)", () => {
        expect(classifyDevice({ userAgent: ANDROID_WHATSAPP, coarsePointer: true, arSupported: false })).toBe("phone-no-ar");
    });

    it("desktop", () => {
        expect(classifyDevice({ userAgent: WINDOWS, coarsePointer: false, arSupported: false })).toBe("desktop");
    });
});
