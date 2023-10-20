import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { XR, useXREvent, ARButton } from "@react-three/xr";
import { Mesh, TextureLoader } from "three";

function ARScene({ imageUrl }: { imageUrl: string }): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  const texture = new TextureLoader().load(imageUrl);

  useXREvent("connected", () => {
    console.log("XR session started!");
  });

  useXREvent("disconnected", () => {
    console.log("XR session ended!");
  });

  useFrame(() => {
    if (meshRef.current) {
      const { rotation } = meshRef.current;
      if (rotation) {
        rotation.x += 0.01;
        rotation.y += 0.01;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeBufferGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function GalleryAR() {
  const imageUrl = "your_image_url.jpg"; // Replace with your image URL

  return (
    <>
      <ARButton />
      <Canvas>
        <XR foveation={0} referenceSpace="local">
          <ambientLight />
          <pointLight position={[10, 10, 10]} />

          <ARScene imageUrl={imageUrl} />
        </XR>
      </Canvas>
    </>
  );
}
