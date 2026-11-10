import { fitWallPlane, unprojectDepth, Vec3 } from "./planeFit";

/** Deterministic rng (mulberry32) so RANSAC runs the same every time. */
const seeded = (seed: number) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const wallPoints = (rng: () => number, z = -2): Vec3[] => {
    const pts: Vec3[] = [];
    for (let i = 0; i < 9; i++)
        for (let j = 0; j < 9; j++)
            pts.push([-0.8 + i * 0.2, 0.8 + j * 0.2, z + (rng() - 0.5) * 0.01]);
    return pts;
};

describe("fitWallPlane", () => {
    it("recovers a wall 2 m ahead", () => {
        const rng = seeded(1);
        const fit = fitWallPlane(wallPoints(rng), { rng })!;
        expect(fit).not.toBeNull();
        expect(Math.abs(Math.abs(fit.normal[2]) - 1)).toBeLessThan(0.02);
        expect(fit.normal[1]).toBe(0);
        expect(fit.point[2]).toBeCloseTo(-2, 1);
        expect(Math.abs(fit.point[2] + 2)).toBeLessThan(0.02);
    });

    it("tolerates 30% outliers", () => {
        const rng = seeded(2);
        const pts = wallPoints(rng);
        for (let i = 0; i < pts.length; i += 3) {
            pts[i] = [rng() * 2 - 1, rng() * 2, -0.5 - rng() * 3];
        }
        const fit = fitWallPlane(pts, { rng })!;
        expect(fit).not.toBeNull();
        expect(Math.abs(fit.point[2] + 2)).toBeLessThan(0.03);
    });

    it("rejects the floor", () => {
        const rng = seeded(3);
        const floor: Vec3[] = [];
        for (let i = 0; i < 9; i++)
            for (let j = 0; j < 9; j++) floor.push([-0.8 + i * 0.2, 0, -1 - j * 0.2]);
        expect(fitWallPlane(floor, { rng })).toBeNull();
    });

    it("needs 20 points", () => {
        const rng = seeded(4);
        expect(fitWallPlane(wallPoints(rng).slice(0, 19), { rng })).toBeNull();
    });
});

describe("unprojectDepth", () => {
    it("round-trips a world point through (u, v, depth)", () => {
        // Perspective projection (fovY 60°, aspect 0.5, near 0.1, far 20), column-major.
        const f = 1 / Math.tan(Math.PI / 6), aspect = 0.5, n = 0.1, far = 20;
        const proj = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + n) / (n - far), -1, 0, 0, (2 * far * n) / (n - far), 0];
        const invProj = invert4(proj);
        // Camera at (0, 1.5, 0), yawed 20° (rotation about Y), column-major view→world matrix.
        const a = (20 * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
        const view = [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 1.5, 0, 1];

        const world: Vec3 = [0.3, 1.7, -2];
        // world → view space (inverse of a rigid transform)
        const d = [world[0] - 0, world[1] - 1.5, world[2] - 0];
        const vs = [c * d[0] - s * d[2], d[1], s * d[0] + c * d[2]];
        // view space → clip → NDC → (u, v) with origin top-left
        const clip = mul4(proj, [vs[0], vs[1], vs[2], 1]);
        const u = (clip[0] / clip[3] + 1) / 2, v = (1 - clip[1] / clip[3]) / 2;

        const back = unprojectDepth(u, v, -vs[2], invProj, view);
        expect(back[0]).toBeCloseTo(world[0], 3);
        expect(back[1]).toBeCloseTo(world[1], 3);
        expect(back[2]).toBeCloseTo(world[2], 3);
    });
});

// --- small column-major 4×4 helpers for the test ---
function mul4(m: number[], v: number[]): number[] {
    const r = [0, 0, 0, 0];
    for (let row = 0; row < 4; row++)
        for (let col = 0; col < 4; col++) r[row] += m[col * 4 + row] * v[col];
    return r;
}
function invert4(m: number[]): number[] {
    const a = m.slice(), inv = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    // Gauss-Jordan on the row-major view of the column-major matrix.
    const at = (r: number, c: number) => c * 4 + r;
    for (let c = 0; c < 4; c++) {
        let p = c;
        for (let r = c + 1; r < 4; r++) if (Math.abs(a[at(r, c)]) > Math.abs(a[at(p, c)])) p = r;
        for (let k = 0; k < 4; k++) {
            [a[at(c, k)], a[at(p, k)]] = [a[at(p, k)], a[at(c, k)]];
            [inv[at(c, k)], inv[at(p, k)]] = [inv[at(p, k)], inv[at(c, k)]];
        }
        const piv = a[at(c, c)];
        for (let k = 0; k < 4; k++) { a[at(c, k)] /= piv; inv[at(c, k)] /= piv; }
        for (let r = 0; r < 4; r++) {
            if (r === c) continue;
            const f = a[at(r, c)];
            for (let k = 0; k < 4; k++) { a[at(r, k)] -= f * a[at(c, k)]; inv[at(r, k)] -= f * inv[at(c, k)]; }
        }
    }
    return inv;
}
