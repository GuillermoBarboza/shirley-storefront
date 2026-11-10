import {
    BufferGeometry,
    Group,
    Material,
    Mesh,
    MeshBasicMaterial,
    Texture,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { fitFramePositions, FRAME_MOULDING_M } from "../../wall/frameFit";

type Part = { geometry: BufferGeometry; material: Material | Material[] };
type FrameParts = { Frame: Part; Back: Part; Painting: Part };

let cached: Promise<FrameParts> | null = null;

/**
 * The owner's frame (public/models/frame.glb, exported from Blender) with every
 * node transform baked into its geometry, turned so the front faces +Z.
 * Loaded once per visit.
 */
const loadParts = (): Promise<FrameParts> => {
    if (!cached) {
        cached = new GLTFLoader()
            .loadAsync("/models/frame.glb")
            .then((gltf) => {
                gltf.scene.updateMatrixWorld(true);
                const parts: Partial<FrameParts> = {};
                gltf.scene.traverse((obj) => {
                    const mesh = obj as Mesh;
                    if (!mesh.isMesh) return;
                    const geometry = mesh.geometry.clone();
                    geometry.applyMatrix4(mesh.matrixWorld);
                    if (mesh.name === "Frame" || mesh.name === "Back" || mesh.name === "Painting") {
                        parts[mesh.name] = { geometry, material: mesh.material };
                    }
                });
                if (!parts.Frame || !parts.Back || !parts.Painting) {
                    throw new Error("frame.glb is missing Frame, Back or Painting");
                }
                const full = parts as FrameParts;

                // The front is on the painting's side of the backing board.
                const midZ = (g: BufferGeometry) => {
                    g.computeBoundingBox();
                    return (g.boundingBox!.min.z + g.boundingBox!.max.z) / 2;
                };
                if (midZ(full.Painting.geometry) < midZ(full.Back.geometry)) {
                    for (const p of Object.values(full)) p.geometry.rotateY(Math.PI);
                }
                // The exported UVs read the image upside down and mirrored once
                // turned to face +Z (checked by rendering a marked test image).
                const uv = full.Painting.geometry.getAttribute("uv");
                for (let i = 0; i < uv.count; i++) uv.setXY(i, 1 - uv.getX(i), 1 - uv.getY(i));
                uv.needsUpdate = true;
                return full;
            })
            .catch((error) => {
                cached = null; // let a later attempt retry
                throw error;
            });
    }
    return cached;
};

/**
 * The frame fitted to a painting of `w` × `h` metres (the photo's own
 * proportions), moulding 4 cm on every side, back at z = 0, front toward +Z,
 * centred. The artwork texture replaces the GLB's placeholder photo.
 * `shared` lists the GLB's own materials, which callers must not dispose.
 */
export const loadFittedFrame = async (
    size: { w: number; h: number },
    artwork: Texture
): Promise<{ group: Group; shared: Set<Material> }> => {
    const parts = await loadParts();
    parts.Frame.geometry.computeBoundingBox();
    parts.Painting.geometry.computeBoundingBox();
    const outer = parts.Frame.geometry.boundingBox!.max.x;
    const inner = parts.Painting.geometry.boundingBox!.max.x;
    const minZ = parts.Frame.geometry.boundingBox!.min.z;
    // The moulding's inner lip starts inside the opening edge; from there out
    // everything keeps a constant width (see frameFit).
    const framePos = parts.Frame.geometry.getAttribute("position");
    let lip = inner;
    for (let i = 0; i < framePos.count; i++) {
        lip = Math.min(lip, Math.abs(framePos.getX(i)), Math.abs(framePos.getY(i)));
    }

    const fit = (src: BufferGeometry): BufferGeometry => {
        const g = src.clone();
        const pos = g.getAttribute("position");
        const shifted = Float32Array.from(pos.array as ArrayLike<number>);
        for (let i = 2; i < shifted.length; i += 3) shifted[i] -= minZ;
        pos.array.set(
            fitFramePositions(shifted, { inner, lip }, {
                w: size.w,
                h: size.h,
                moulding: FRAME_MOULDING_M,
                mouldingModel: outer - inner,
            })
        );
        pos.needsUpdate = true;
        // Each region is only translated and uniformly scaled, so Blender's
        // normals stay valid.
        g.computeBoundingBox();
        return g;
    };

    const group = new Group();
    group.add(new Mesh(fit(parts.Frame.geometry), parts.Frame.material));
    group.add(new Mesh(fit(parts.Back.geometry), parts.Back.material));
    // Unlit: the artwork shows its own colours whatever the room lighting estimate.
    group.add(new Mesh(fit(parts.Painting.geometry), new MeshBasicMaterial({ map: artwork })));
    const shared = new Set<Material>();
    for (const m of [parts.Frame.material, parts.Back.material].flat()) shared.add(m);
    return { group, shared };
};
