/**
 * Fits the owner's square frame model (public/models/frame.glb) to any
 * painting without distorting it: the moulding keeps its profile and a
 * constant width on all four sides, corners included. Only the straight runs
 * get longer or shorter.
 *
 * Works on the frame's baked positions: X = width, Y = height, +Z toward the
 * viewer, in model units.
 */

/** Real width of the moulding. The GLB carries no real-world units. */
export const FRAME_MOULDING_M = 0.04;

/**
 * One axis, model units → metres. From the moulding's innermost point (`lip`,
 * which sits a little inside the opening edge `inner`) outward, every vertex
 * keeps its distance from the opening edge, scaled by `s` — so the whole
 * profile, lip included, is the same width on all four sides. Only what lies
 * inside the lip (nothing, on the real frame) stretches.
 */
export const remapAxis = (
    v: number,
    inner: number,
    halfOpening: number,
    s: number,
    lip: number = inner
): number => {
    const abs = Math.abs(v);
    if (abs >= lip) return Math.sign(v) * (halfOpening + (abs - inner) * s);
    return (v * (halfOpening + (lip - inner) * s)) / lip;
};

export const fitFramePositions = (
    src: Float32Array,
    model: { inner: number; lip?: number },
    target: { w: number; h: number; moulding: number; mouldingModel: number }
): Float32Array => {
    const s = target.moulding / target.mouldingModel;
    const out = new Float32Array(src.length);
    for (let i = 0; i < src.length; i += 3) {
        out[i] = remapAxis(src[i], model.inner, target.w / 2, s, model.lip);
        out[i + 1] = remapAxis(src[i + 1], model.inner, target.h / 2, s, model.lip);
        out[i + 2] = src[i + 2] * s;
    }
    return out;
};
