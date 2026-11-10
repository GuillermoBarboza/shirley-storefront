/**
 * Finds a wall from the phone's depth readings. Phone AR can't detect plain
 * white walls as surfaces, but WebXR depth-sensing still gives distances, so
 * we sample them, lift them into 3D and fit an upright plane.
 *
 * Plain tuples and column-major 4×4 arrays (as WebXR hands them over), so this
 * stays testable without three.js.
 */

export type Vec3 = [number, number, number];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];
const length = (a: Vec3): number => Math.sqrt(dot(a, a));

/** Column-major 4×4 times (x, y, z, w). */
const transform = (m: ArrayLike<number>, x: number, y: number, z: number, w: number) => [
    m[0] * x + m[4] * y + m[8] * z + m[12] * w,
    m[1] * x + m[5] * y + m[9] * z + m[13] * w,
    m[2] * x + m[6] * y + m[10] * z + m[14] * w,
    m[3] * x + m[7] * y + m[11] * z + m[15] * w,
];

/**
 * Normalized view coordinates (origin top-left — assumed for Chrome's depth
 * API) plus depth along the view axis → world point.
 */
export const unprojectDepth = (
    u: number,
    v: number,
    depthM: number,
    invProjection: ArrayLike<number>,
    viewMatrix: ArrayLike<number>
): Vec3 => {
    const p = transform(invProjection, u * 2 - 1, 1 - v * 2, 0, 1);
    const k = depthM / -(p[2] / p[3]);
    const vx = (p[0] / p[3]) * k, vy = (p[1] / p[3]) * k, vz = -depthM;
    const w = transform(viewMatrix, vx, vy, vz, 1);
    return [w[0], w[1], w[2]];
};

/**
 * RANSAC an upright wall through `points`. The normal comes back horizontal
 * (walls are hung on, so a slight lean in the depth data must not tilt the
 * painting); the point is the inliers' centroid.
 */
export const fitWallPlane = (
    points: Vec3[],
    opts: {
        rng?: () => number;
        band?: number;
        minInlierRatio?: number;
        maxNormalY?: number;
        iterations?: number;
    } = {}
): { point: Vec3; normal: Vec3; inliers: number } | null => {
    const {
        rng = Math.random,
        band = 0.03,
        minInlierRatio = 0.6,
        maxNormalY = 0.35,
        iterations = 60,
    } = opts;
    if (points.length < 20) return null;

    const pick = () => points[Math.floor(rng() * points.length)];
    let best: { origin: Vec3; normal: Vec3; inliers: number } | null = null;
    for (let it = 0; it < iterations; it++) {
        const a = pick(), b = pick(), c = pick();
        const n = cross(sub(b, a), sub(c, a));
        const len = length(n);
        if (len < 1e-6) continue;
        const normal: Vec3 = [n[0] / len, n[1] / len, n[2] / len];
        if (Math.abs(normal[1]) > maxNormalY) continue;
        let inliers = 0;
        for (const p of points) if (Math.abs(dot(sub(p, a), normal)) < band) inliers++;
        if (!best || inliers > best.inliers) best = { origin: a, normal, inliers };
    }
    if (!best || best.inliers < points.length * minInlierRatio) return null;

    const centroid: Vec3 = [0, 0, 0];
    let k = 0;
    for (const p of points) {
        if (Math.abs(dot(sub(p, best.origin), best.normal)) >= band) continue;
        centroid[0] += p[0]; centroid[1] += p[1]; centroid[2] += p[2];
        k++;
    }
    const flat = Math.hypot(best.normal[0], best.normal[2]);
    return {
        point: [centroid[0] / k, centroid[1] / k, centroid[2] / k],
        normal: [best.normal[0] / flat, 0, best.normal[2] / flat],
        inliers: k,
    };
};
