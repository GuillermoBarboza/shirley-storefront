import { useEffect, useState } from "react";
import { classifyDevice, WallMode } from "../wall/device";

let cached: Promise<WallMode> | null = null;

const detect = (): Promise<WallMode> => {
    if (!cached) {
        const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
        const supported: Promise<boolean> = xr
            ? xr.isSessionSupported("immersive-ar").catch(() => false)
            : Promise.resolve(false);
        cached = supported.then((arSupported) =>
            classifyDevice({
                userAgent: navigator.userAgent,
                coarsePointer:
                    typeof window.matchMedia === "function" &&
                    window.matchMedia("(pointer: coarse)").matches,
                arSupported,
            })
        );
    }
    return cached;
};

/** What "Ver en tu pared" can offer on this device; null while checking. */
export const useWallMode = (): WallMode | null => {
    const [mode, setMode] = useState<WallMode | null>(null);
    useEffect(() => {
        let alive = true;
        detect().then((m) => {
            if (alive) setMode(m);
        });
        return () => {
            alive = false;
        };
    }, []);
    return mode;
};
