import React, { Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout/Layout";
import styles from "./VirtualGallery.module.css";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Mesh, TextureLoader, Texture, ShaderMaterial } from "three";
import axios from "axios";

function ModelLogger({ url, imgUrl }: { url: string; imgUrl: string | null }) {
  const gltf = useGLTF(url);

  // Always pass a string - useLoader must be called unconditionally
  const textureUrl = imgUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const customTexture = useLoader(TextureLoader, textureUrl) as Texture;

  useEffect(() => {
    console.log("useEffect triggered - imgUrl:", imgUrl);
    
    if (!imgUrl) {
      console.log("Skipping texture application - no imgUrl provided");
      return;
    }
    
    if (!customTexture?.image) {
      console.log("Skipping - no texture image");
      return;
    }
    
    // Step 1: Get image dimensions and aspect ratio
    const imgW = (customTexture.image as { width: number }).width;
    const imgH = (customTexture.image as { height: number }).height;
    const imgAspect = imgW / imgH;
    console.log("Image dimensions:", { width: imgW, height: imgH, aspect: imgAspect });
    
    // Step 2: Get Painting mesh original dimensions to understand its aspect
    let paintingWidth = 1;
    let paintingDepth = 1;
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh && obj.name === "Painting") {
        obj.geometry.computeBoundingBox();
        const box = obj.geometry.boundingBox;
        if (box) {
          paintingWidth = box.max.x - box.min.x;
          paintingDepth = box.max.z - box.min.z;
          console.log("Painting mesh original size:", { width: paintingWidth, depth: paintingDepth });
        }
      }
    });
    
    // Step 3: Calculate scale factor to match image aspect ratio
    // Painting is square (1:1), image is portrait (0.8:1), so scale X by 0.8
    const scaleX = imgAspect; // For square mesh, scaleX = image aspect
    console.log("Scaling factor:", { scaleX, imgAspect });
    
    // Step 4: Scale all meshes to match image aspect ratio
    const targets = ["Frame", "Back", "Painting"];
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh && targets.includes(obj.name)) {
        obj.scale.set(scaleX, 1, 1);
        console.log(`Scaled '${obj.name}' by ${scaleX}`);
      }
    });
    
    // Step 4b: Put Frame and Back on layer 0 (will be lit), Painting on layer 1 (unlit)
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        if (obj.name === "Painting") {
          obj.layers.set(1);  // Painting on layer 1
        } else if (obj.name === "Frame" || obj.name === "Back") {
          obj.layers.set(0);  // Frame/Back on layer 0
        }
      }
    });
    
    // Step 5: Apply texture to Painting - use ShaderMaterial for true color rendering
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh && obj.name === "Painting") {
        // Ensure Painting is on layer 1 (no lights affect it)
        obj.layers.disableAll();
        obj.layers.enable(1);
        
        // Use ShaderMaterial for precise control over texture rendering
        obj.material = new ShaderMaterial({
          uniforms: {
            map: { value: customTexture }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D map;
            varying vec2 vUv;
            void main() {
              gl_FragColor = texture2D(map, vUv);
            }
          `,
          side: 2  // DoubleSide
        });
        
        console.log("Applied ShaderMaterial with URL texture - painting unaffected by lights");
      }
    });
  }, [gltf, customTexture, imgUrl]);

  return <primitive object={gltf.scene} />;
}

const VirtualGallery: React.FC = () => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest artwork from API (adjust endpoint/env as needed)
    async function fetchLatestImage() {
      try {
        const endpoint = process.env.REACT_APP_API_ENDPOINT || "";
        const response = await axios.get(`${endpoint}/latest`);
        const artwork = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        const url = artwork.url || artwork.image || artwork.img || null;
        setImgUrl(url);
      } catch (err) {
        console.error("Failed to fetch latest artwork", err);
        setImgUrl(null);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestImage();
  }, []);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>Concepto</div>
          <h1 className={styles.title}>Sala Virtual</h1>
          <p className={styles.lede}>
            Recorrido inmersivo por la obra, pensado como un espacio 3D
            navegable. Arrastrá para girar la pieza y explorarla desde
            cualquier ángulo.
          </p>
        </div>

        <div className={styles.stage}>
        <Suspense fallback={<div className={styles.state}>Cargando la sala…</div>}>
          {loading ? (
            <div className={styles.state}>Cargando la sala…</div>
          ) : !imgUrl ? (
            <div className={styles.state}>
              No pudimos cargar la obra. Intentá de nuevo en unos minutos.
            </div>
          ) : (
            <Canvas camera={{ position: [0, 1, -3], fov: 50 }} onCreated={({ camera, scene }) => {
              // Camera sees both layers
              camera.layers.enable(0);
              camera.layers.enable(1);

              // Find lights and set them to only affect layer 0
              scene.children.forEach((child: any) => {
                if (child.isLight) {
                  child.layers.disableAll();
                  child.layers.enable(0);  // Only layer 0
                }
              });
            }}>
              <ambientLight intensity={0.6} color={0xFFB347} />
              <directionalLight position={[1, 2, -3]} intensity={0.6} color={0xFFB347} />
              <ModelLogger url="/models/frame.glb" imgUrl={imgUrl} />
              <OrbitControls />
            </Canvas>
          )}
        </Suspense>
        </div>
        <div className={styles.plinth} />
        <div className={styles.hint}>Arrastrá para rotar · rueda para acercar</div>

        <div className={styles.actions}>
          <Link to="/galeria" className="btn">
            Volver a la galería
          </Link>
        </div>
      </div>
    </Layout>
  );
};

useGLTF.preload("/models/frame.glb");

export default VirtualGallery;
