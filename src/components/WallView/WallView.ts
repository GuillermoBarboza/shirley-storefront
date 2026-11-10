/**
 * "Ver en tu pared": hangs a painting, framed and at real size, on the
 * visitor's wall through WebXR (Android Chrome).
 *
 * Lazy-loaded: only `WallEntry` imports it, and only on AR-capable phones.
 * Plain white walls give phone AR no surface to detect, so the wall is found
 * by a ladder: detected vertical plane → plane-detection extended across the
 * blank wall → the depth buffer fitted to an upright plane → a manual
 * nearer/farther nudge. Ported from the workspace spike v5, tested on a Moto
 * g75 against a white wall.
 */
import {
    BufferGeometry,
    CanvasTexture,
    DirectionalLight,
    Group,
    HemisphereLight,
    LineBasicMaterial,
    LineLoop,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Quaternion,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer,
} from "three";
import { Artwork } from "../../types/artwork";
import { paintingSize } from "../../wall/size";
import { FRAME_MOULDING_M } from "../../wall/frameFit";
import { fitWallPlane, unprojectDepth, Vec3 } from "../../wall/planeFit";
import { loadFittedFrame } from "./frameModel";
import css from "./WallView.module.css";

const MAX_TEX = 2048;
const MANUAL_AFTER_MS = 6000;
const STABLE_FRAMES = 10;
const MANUAL_START_M = 2;
const MANUAL_STEP_M = 0.1;
const MANUAL_MIN_M = 0.5;
const MANUAL_MAX_M = 5;

const UP = new Vector3(0, 1, 0);

type Candidate = { pt: Vector3; n: Vector3; source: "plano" | "plano extendido" | "profundidad" | "manual" };

// ---------- geometry helpers ----------
const flatten = (n: Vector3): Vector3 | null => {
    const f = new Vector3(n.x, 0, n.z);
    return f.lengthSq() < 1e-6 ? null : f.normalize();
};
const wallQuat = (n: Vector3): Quaternion => {
    const right = new Vector3().crossVectors(UP, n).normalize();
    return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, UP, n));
};
const towardCamera = (n: Vector3, pt: Vector3, cam: Vector3): Vector3 =>
    n.dot(new Vector3().subVectors(cam, pt)) < 0 ? n.clone().negate() : n.clone();
const rayPlane = (origin: Vector3, dir: Vector3, pt: Vector3, n: Vector3): Vector3 | null => {
    const d = dir.dot(n);
    if (Math.abs(d) < 1e-3) return null;
    const t = new Vector3().subVectors(pt, origin).dot(n) / d;
    return t > 0.2 && t < 8 ? origin.clone().addScaledVector(dir, t) : null;
};
const toVec = (p: { x: number; y: number; z: number }) => new Vector3(p.x, p.y, p.z);
const toQuat = (o: { x: number; y: number; z: number; w: number }) => new Quaternion(o.x, o.y, o.z, o.w);

const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((ok, fail) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => ok(img);
        img.onerror = () => fail(new Error("image"));
        img.src = url;
    });

const textureFrom = (img: HTMLImageElement): CanvasTexture => {
    const s = Math.min(1, MAX_TEX / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s);
    c.height = Math.round(img.height * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.flipY = false; // matches the frame model's UVs
    return t;
};

/** Real-size outline shown on the wall while aiming. */
const buildOutline = (w: number, h: number): Group => {
    const W = w + 2 * FRAME_MOULDING_M, H = h + 2 * FRAME_MOULDING_M;
    const pts = [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]].map(
        ([x, y]) => new Vector3(x, y, 0.002)
    );
    const g = new Group();
    g.add(new LineLoop(new BufferGeometry().setFromPoints(pts), new LineBasicMaterial({ color: 0xffffff })));
    const fill = new Mesh(
        new PlaneGeometry(W, H),
        new MeshBasicMaterial({ color: 0xb98a3a, transparent: true, opacity: 0.22, depthWrite: false })
    );
    fill.position.z = 0.001;
    g.add(fill);
    return g;
};

// ---------- one renderer for the page lifetime (tearing it down mid-exit crashed the spike) ----------
let renderer: WebGLRenderer | null = null;
const scene = new Scene();
const camera = new PerspectiveCamera();
const root = new Group(); // follows the anchor; the painting sits at its origin
scene.add(new HemisphereLight(0xffffff, 0x8a7f72, 1.6));
const sun = new DirectionalLight(0xffffff, 1.2);
sun.position.set(0.5, 1, 1);
scene.add(sun);
scene.add(root);

const getRenderer = (): WebGLRenderer => {
    if (!renderer) {
        renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = SRGBColorSpace;
        // three r152 still defaults to legacy lights, which scale every light by π
        // and wash the artwork out. The spikes ran with physically-correct lights.
        (renderer as WebGLRenderer & { useLegacyLights: boolean }).useLegacyLights = false;
        renderer.xr.enabled = true;
        renderer.xr.setReferenceSpaceType("local");
        renderer.domElement.style.display = "none";
        document.body.appendChild(renderer.domElement);
    }
    return renderer;
};

let active = false;

/** Frees what a session built. The GLB's own frame materials are shared and stay. */
const disposeGroup = (g: Group | null, keep: Set<unknown>) => {
    g?.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.geometry) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
            if (!m || keep.has(m)) continue;
            (m as MeshBasicMaterial).map?.dispose();
            m.dispose();
        }
    });
};

// ---------- overlay ----------
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = ""): HTMLElementTagNameMap[K] => {
    const e = document.createElement(tag);
    e.className = className;
    e.textContent = text;
    return e;
};

const buildOverlay = () => {
    const root = el("div", css.overlay);
    const hint = el("div", css.hint);
    const hintText = el("span", "");
    const badge = el("div", css.badge, "Tamaño aproximado");
    badge.style.display = "none";
    hint.append(hintText, badge);
    const exit = el("button", css.exit, "✕");
    exit.setAttribute("aria-label", "Salir");
    const aim = el("div", css.aim);
    aim.style.display = "none";
    const lost = el("div", css.lost, "Perdimos la pared un momento. Apuntá despacio: el cuadro queda donde estaba.");
    lost.style.display = "none";
    const bar = el("div", css.bar);
    const nearer = el("button", `btn ${css.ghost}`, "− Más cerca");
    const place = el("button", "btn btn--olive", "Colgar aquí");
    const farther = el("button", `btn ${css.ghost}`, "Más lejos +");
    const move = el("button", `btn ${css.ghost}`, "Mover");
    const again = el("button", `btn ${css.ghost}`, "Otra pared");
    bar.append(nearer, place, farther, move, again);
    root.append(hint, exit, aim, lost, bar);
    // Taps on our buttons must not also count as an AR "select".
    for (const b of [exit, nearer, place, farther, move, again]) {
        b.addEventListener("beforexrselect", (e) => e.preventDefault());
    }
    return { root, hintText, badge, exit, aim, lost, nearer, place, farther, move, again };
};

/**
 * Starts the AR view. Calls `requestSession` before anything else is awaited
 * so the visitor's tap still counts as the user gesture browsers require.
 */
export const startWallView = async ({
    artwork,
    imageUrl,
    onEnd,
}: {
    artwork: Artwork;
    imageUrl: string;
    onEnd: () => void;
}): Promise<void> => {
    if (active || !navigator.xr) return;
    active = true;

    const ui = buildOverlay();
    document.body.appendChild(ui.root);

    let session: XRSession;
    try {
        session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["depth-sensing", "plane-detection", "anchors", "dom-overlay", "light-estimation"],
            depthSensing: { usagePreference: ["cpu-optimized"], dataFormatPreference: ["luminance-alpha", "float32"] },
            domOverlay: { root: ui.root },
        } as XRSessionInit);
    } catch (error) {
        ui.root.remove();
        active = false;
        throw error;
    }

    const r = getRenderer();
    let refSpace: XRReferenceSpace;
    let hitSource: XRHitTestSource | undefined;
    let painting: Group | null = null;
    const sharedMaterials = new Set<unknown>();
    let outline: Group | null = null;
    let state: "loading" | "failed" | "aiming" | "placed" | "moving" = "loading";
    let candidate: Candidate | null = null;
    let anchor: XRAnchor | null = null;
    let pendingPlace = false, pendingMove = false;
    let aimSince = 0, lostFrames = 0, manualDist = MANUAL_START_M;
    const depthHistory: { hit: Vector3; n: Vector3 }[] = [];

    const show = (e: HTMLElement, on: boolean) => { e.style.display = on ? "" : "none"; };
    const sync = () => {
        const manual = state === "aiming" && candidate?.source === "manual";
        show(ui.place, (state === "aiming" && !!candidate) || state === "moving");
        show(ui.nearer, manual);
        show(ui.farther, manual);
        show(ui.move, state === "placed");
        show(ui.again, state === "placed");
        show(ui.aim, state === "moving");
    };
    const hint = (t: string) => { ui.hintText.textContent = t; };

    let ended = false;
    const end = () => {
        if (ended) return;
        ended = true;
        r.setAnimationLoop(null);
        r.domElement.style.display = "none";
        ui.root.remove();
        try { hitSource?.cancel(); } catch { /* ended with the session */ }
        if (painting) root.remove(painting);
        if (outline) scene.remove(outline);
        disposeGroup(painting, sharedMaterials);
        disposeGroup(outline, sharedMaterials);
        painting = null;
        outline = null;
        anchor = null; // anchors die with the session; deleting them now would throw
        active = false;
        onEnd();
    };
    session.addEventListener("end", end);
    ui.exit.addEventListener("click", () => { session.end().catch(() => end()); });

    try {
        r.setSize(window.innerWidth, window.innerHeight);
        r.domElement.style.display = "";
        await r.xr.setSession(session as unknown as Parameters<WebGLRenderer["xr"]["setSession"]>[0]);
        if (ended) return;
        refSpace = r.xr.getReferenceSpace()!;
        const viewerSpace = await session.requestReferenceSpace("viewer");
        if (ended) return;
        hitSource = await session.requestHitTestSource?.({ space: viewerSpace });
        if (ended) return;
    } catch (error) {
        console.error("No se pudo preparar la realidad aumentada:", error);
        session.end().catch(() => end());
        return;
    }
    root.position.set(0, 0, 0);
    root.quaternion.identity();
    hint("Cargando la obra…");
    sync();

    // Assets load after the session started, so the tap gesture wasn't spent waiting.
    try {
        const img = await loadImage(imageUrl);
        if (ended) return;
        const size = paintingSize(artwork.size, img.width, img.height);
        const built = await loadFittedFrame(size, textureFrom(img));
        if (ended) {
            disposeGroup(built.group, built.shared);
            return;
        }
        built.shared.forEach((m) => sharedMaterials.add(m));
        painting = built.group;
        painting.visible = false;
        root.add(painting);
        outline = buildOutline(size.w, size.h);
        outline.visible = false;
        scene.add(outline);
        show(ui.badge, size.approximate);
        state = "aiming";
        aimSince = performance.now();
    } catch (error) {
        if (ended) return;
        console.error("No se pudo cargar la obra:", error);
        state = "failed";
        hint("No pudimos cargar la obra.");
    }
    sync();

    /** Best wall under the screen centre, most trustworthy source first. */
    const findWall = (frame: XRFrame, viewer: XRViewerPose, camPos: Vector3, camDir: Vector3): Candidate | null => {
        if (hitSource) {
            for (const h of frame.getHitTestResults(hitSource)) {
                const pose = h.getPose(refSpace);
                if (!pose) continue;
                const nrm = UP.clone().applyQuaternion(toQuat(pose.transform.orientation));
                if (Math.abs(nrm.y) > 0.75) continue;
                const n = flatten(nrm);
                const pt = toVec(pose.transform.position);
                if (n) return { pt, n: towardCamera(n, pt, camPos), source: "plano" };
            }
        }
        const planes = (frame as XRFrame & { detectedPlanes?: Set<XRPlane> }).detectedPlanes;
        if (planes) {
            let best: Candidate | null = null;
            planes.forEach((plane) => {
                if (plane.orientation !== "vertical") return;
                const pose = frame.getPose(plane.planeSpace, refSpace);
                if (!pose) return;
                const n = flatten(UP.clone().applyQuaternion(toQuat(pose.transform.orientation)));
                if (!n) return;
                const hit = rayPlane(camPos, camDir, toVec(pose.transform.position), n);
                if (hit && (!best || hit.distanceTo(camPos) < best.pt.distanceTo(camPos))) {
                    best = { pt: hit, n: towardCamera(n, hit, camPos), source: "plano extendido" };
                }
            });
            if (best) return best;
        }
        const view = viewer.views[0];
        let depth: XRCPUDepthInformation | null = null;
        try { depth = frame.getDepthInformation?.(view) ?? null; } catch { depth = null; }
        if (depth) {
            const invProj = new Matrix4().fromArray(view.projectionMatrix).invert().toArray();
            const pts: Vec3[] = [];
            const N = 9, SPAN = 0.4;
            for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
                const u = 0.5 + (i / (N - 1) - 0.5) * SPAN, v = 0.5 + (j / (N - 1) - 0.5) * SPAN;
                let d = 0;
                try { d = depth.getDepthInMeters(u, v); } catch { continue; }
                if (d > 0.3 && d < 6) pts.push(unprojectDepth(u, v, d, invProj, view.transform.matrix));
            }
            const fit = fitWallPlane(pts);
            if (fit) {
                const n = new Vector3(...fit.normal);
                const hit = rayPlane(camPos, camDir, new Vector3(...fit.point), n);
                if (hit) {
                    depthHistory.push({ hit, n });
                    if (depthHistory.length > STABLE_FRAMES) depthHistory.shift();
                    const stable = depthHistory.length === STABLE_FRAMES &&
                        depthHistory.every((h) => h.hit.distanceTo(hit) < 0.08 && h.n.dot(n) > 0.97);
                    if (stable) return { pt: hit, n: towardCamera(n, hit, camPos), source: "profundidad" };
                    return null;
                }
            }
            depthHistory.length = 0;
        }
        return null;
    };

    /** Anchors can only be created inside an XR frame. */
    const placeAt = async (frame: XRFrame, c: Candidate) => {
        pendingPlace = false;
        const q = wallQuat(c.n);
        root.position.copy(c.pt);
        root.quaternion.copy(q);
        anchor = null;
        try {
            anchor = (await frame.createAnchor?.(
                new XRRigidTransform({ x: c.pt.x, y: c.pt.y, z: c.pt.z }, { x: q.x, y: q.y, z: q.z, w: q.w }),
                refSpace
            )) ?? null;
        } catch (error) {
            console.warn("Sin anclaje; el cuadro queda fijo en el espacio local:", error);
        }
        painting!.position.set(0, 0, 0);
        painting!.visible = true;
        outline!.visible = false;
        state = "placed";
        hint("Colgado. Mirá alrededor: queda en su lugar. “Mover” para reubicarlo.");
        sync();
    };

    const onFrame = (_t: number, frame?: XRFrame) => {
        if (!frame) return;
        const viewer = frame.getViewerPose(refSpace);
        const lost = !viewer || viewer.emulatedPosition;
        lostFrames = lost ? lostFrames + 1 : 0;
        show(ui.lost, lostFrames > 20 && (state === "placed" || state === "moving"));

        if (anchor && frame.trackedAnchors?.has(anchor)) {
            const ap = frame.getPose(anchor.anchorSpace, refSpace);
            if (ap) {
                root.position.copy(toVec(ap.transform.position));
                root.quaternion.copy(toQuat(ap.transform.orientation));
            }
        }
        if (viewer) {
            const camPos = toVec(viewer.transform.position);
            const camDir = new Vector3(0, 0, -1).applyQuaternion(toQuat(viewer.transform.orientation));

            if (state === "aiming" && outline) {
                const found = findWall(frame, viewer, camPos, camDir);
                if (found) candidate = found;
                else if (performance.now() - aimSince > MANUAL_AFTER_MS) {
                    const fwd = flatten(camDir) ?? new Vector3(0, 0, -1);
                    const n = fwd.clone().negate();
                    const hit = rayPlane(camPos, camDir, camPos.clone().addScaledVector(fwd, manualDist), n);
                    candidate = hit ? { pt: hit, n, source: "manual" } : null;
                } else candidate = null;

                if (candidate) {
                    outline.visible = true;
                    outline.position.copy(candidate.pt);
                    outline.quaternion.copy(wallQuat(candidate.n));
                    hint(candidate.source === "manual"
                        ? "Ajustá “más cerca / más lejos” hasta que el marco quede apoyado en la pared, y colgalo."
                        : "Pared encontrada. Tocá para colgarlo acá.");
                    if (pendingPlace) placeAt(frame, candidate);
                } else {
                    outline.visible = false;
                    hint("Apuntá a la pared y mové el teléfono despacio de costado…");
                }
                sync();
            }

            if (state === "moving" && painting) {
                root.updateMatrixWorld(true);
                const wallPt = new Vector3().setFromMatrixPosition(root.matrixWorld);
                const n = new Vector3(0, 0, 1).transformDirection(root.matrixWorld);
                const hit = rayPlane(camPos, camDir, wallPt, n);
                if (hit) painting.position.copy(hit.applyMatrix4(root.matrixWorld.clone().invert())).setZ(0);
                if (pendingMove) {
                    pendingMove = false;
                    state = "placed";
                    hint("Listo. Queda fijo en esta posición.");
                    sync();
                }
            }
        }
        r.render(scene, camera);
    };

    const requestPlace = () => {
        if (state === "aiming" && candidate) pendingPlace = true;
        else if (state === "moving") pendingMove = true;
    };
    session.addEventListener("select", requestPlace);
    ui.place.addEventListener("click", requestPlace);
    ui.nearer.addEventListener("click", () => { manualDist = Math.max(MANUAL_MIN_M, manualDist - MANUAL_STEP_M); });
    ui.farther.addEventListener("click", () => { manualDist = Math.min(MANUAL_MAX_M, manualDist + MANUAL_STEP_M); });
    ui.move.addEventListener("click", () => {
        state = "moving";
        hint("Apuntá a donde lo querés en la pared y tocá para fijarlo.");
        sync();
    });
    ui.again.addEventListener("click", () => {
        if (painting) painting.visible = false;
        candidate = null;
        depthHistory.length = 0;
        aimSince = performance.now();
        state = "aiming";
        sync();
    });

    if (!ended) r.setAnimationLoop(onFrame as Parameters<WebGLRenderer["setAnimationLoop"]>[0]);
};
