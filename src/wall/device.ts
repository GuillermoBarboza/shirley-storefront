/**
 * What the painting modal offers for "Ver en tu pared" on this device.
 *  - ar: the browser can run WebXR AR (Android Chrome with ARCore)
 *  - iphone: no WebXR in Safari; AR isn't built for iPhone yet
 *  - phone-no-ar: a phone whose browser can't (WhatsApp/Instagram in-app,
 *    Samsung Internet, Firefox, no ARCore) — a QR would point at itself
 *  - desktop: anything else; offer a QR to open it on a phone
 */
export type WallMode = "ar" | "iphone" | "phone-no-ar" | "desktop";

export const classifyDevice = ({
    userAgent,
    coarsePointer,
    arSupported,
}: {
    userAgent: string;
    coarsePointer: boolean;
    arSupported: boolean;
}): WallMode => {
    if (arSupported) return "ar";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "iphone";
    if (/Android/i.test(userAgent) || coarsePointer) return "phone-no-ar";
    return "desktop";
};
