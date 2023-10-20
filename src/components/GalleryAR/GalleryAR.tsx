import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei"; // Corrected import
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  TextureLoader,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  Scene,
} from "three"; // Import individual components

// Define the type for the ARScene props
type ARSceneProps = {
  imageUrl: string;
};

// Define your AR scene using React Three Fiber
function ARScene({ imageUrl }: ARSceneProps) {
  const texture = new TextureLoader().load(imageUrl);

  const planeGeometry = new PlaneGeometry(2, 2);
  const planeMaterial = new MeshBasicMaterial({ map: texture });
  const planeMesh = new Mesh(planeGeometry, planeMaterial);

  const scene = new Scene();
  scene.add(planeMesh);

  useFrame(() => {
    // Add any animation logic here
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls enableZoom={false} enablePan={false} enableDamping />
      <primitive object={scene} />
    </>
  );
}

// Define the type for the GalleryAR props
type GalleryARProps = {
  imageUrl: string;
  onClose: () => void;
};

function GalleryAR({ imageUrl, onClose }: GalleryARProps) {
  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
      <Canvas style={{ width: "100%", height: "100%" }}>
        <ARScene imageUrl={imageUrl} />
      </Canvas>
    </div>
  );
}

export default GalleryAR;
