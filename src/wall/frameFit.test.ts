import { fitFramePositions, remapAxis, FRAME_MOULDING_M } from "./frameFit";

// frame.glb: outer half 4.965, inner half 4.227 → moulding 0.738 model units.
const INNER = 4.227;
// The real moulding has an inner lip that starts inside the opening edge.
const LIP = 4.0754;
const MOULDING_MODEL = 0.738;
const s = FRAME_MOULDING_M / MOULDING_MODEL;

/** A square stand-in for the frame mesh: rings at the inner edge, mid-profile and outer edge. */
const syntheticFrame = (): Float32Array => {
    const coords = [-4.965, -4.6, -4.227, -LIP, LIP, 4.227, 4.6, 4.965];
    const out: number[] = [];
    for (const x of coords) for (const y of coords) for (const z of [-0.2, 0.06]) out.push(x, y, z);
    return new Float32Array(out);
};

const fit = (w: number, h: number) =>
    fitFramePositions(syntheticFrame(), { inner: INNER, lip: LIP }, {
        w,
        h,
        moulding: FRAME_MOULDING_M,
        mouldingModel: MOULDING_MODEL,
    });

const bounds = (p: Float32Array) => {
    let maxX = -Infinity, maxY = -Infinity, minX = Infinity, minY = Infinity;
    for (let i = 0; i < p.length; i += 3) {
        maxX = Math.max(maxX, p[i]); minX = Math.min(minX, p[i]);
        maxY = Math.max(maxY, p[i + 1]); minY = Math.min(minY, p[i + 1]);
    }
    return { minX, maxX, minY, maxY };
};

describe("frameFit", () => {
    it("opening matches the painting", () => {
        expect(remapAxis(INNER, INNER, 0.2, s)).toBeCloseTo(0.2, 9);
        expect(remapAxis(-INNER, INNER, 0.25, s)).toBeCloseTo(-0.25, 9);
    });

    it("moulding is 4 cm on every side", () => {
        const b = bounds(fit(0.4, 0.5));
        expect(b.maxX).toBeCloseTo(0.24, 6);
        expect(b.minX).toBeCloseTo(-0.24, 6);
        expect(b.maxY).toBeCloseTo(0.29, 6);
        expect(b.minY).toBeCloseTo(-0.29, 6);
    });

    it.each([
        [1.2, 0.4],
        [0.2, 0.8],
    ])("keeps moulding width at %s × %s", (w, h) => {
        const b = bounds(fit(w, h));
        expect(b.maxX - w / 2).toBeCloseTo(0.04, 6);
        expect(b.maxY - h / 2).toBeCloseTo(0.04, 6);
        expect(-b.minX - w / 2).toBeCloseTo(0.04, 6);
        expect(-b.minY - h / 2).toBeCloseTo(0.04, 6);
    });

    it("profile scales uniformly", () => {
        expect(remapAxis(4.6, INNER, 0.2, s)).toBeCloseTo(0.2 + (4.6 - INNER) * s, 9);
        const p = fit(0.4, 0.5);
        const zs = new Set<number>();
        for (let i = 2; i < p.length; i += 3) zs.add(Math.round(p[i] * 1e6));
        expect(Array.from(zs).sort((a, b) => a - b)).toEqual([
            Math.round(-0.2 * s * 1e6),
            Math.round(0.06 * s * 1e6),
        ]);
    });

    it.each([
        [0.4, 0.5],
        [1.2, 0.4],
        [0.2, 0.8],
        [1.0, 0.8],
    ])("keeps the inner lip the same width on every side at %s × %s", (w, h) => {
        const lipWidth = (INNER - LIP) * s;
        for (const half of [w / 2, h / 2]) {
            const edge = remapAxis(INNER, INNER, half, s, LIP);
            const lip = remapAxis(LIP, INNER, half, s, LIP);
            expect(edge - lip).toBeCloseTo(lipWidth, 9);
            expect(remapAxis(-INNER, INNER, half, s, LIP) - remapAxis(-LIP, INNER, half, s, LIP)).toBeCloseTo(-lipWidth, 9);
        }
    });

    it("stretches only inside the lip, continuously", () => {
        const half = 0.2;
        const atLip = remapAxis(LIP, INNER, half, s, LIP);
        expect(remapAxis(LIP / 2, INNER, half, s, LIP)).toBeCloseTo(atLip / 2, 9);
        expect(remapAxis(0, INNER, half, s, LIP)).toBe(0);
    });

    it("does not mutate the input", () => {
        const src = syntheticFrame();
        const copy = Float32Array.from(src);
        fitFramePositions(src, { inner: INNER, lip: LIP }, {
            w: 0.4,
            h: 0.5,
            moulding: FRAME_MOULDING_M,
            mouldingModel: MOULDING_MODEL,
        });
        expect(src).toEqual(copy);
    });
});
