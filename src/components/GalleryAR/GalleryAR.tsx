import React, { useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { XR, useXREvent, ARButton } from "@react-three/xr";
import { Mesh, TextureLoader } from "three";

function ARScene({ imageUrl }: { imageUrl: string }): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  const { gl } = useThree();
  // set renderer.domElement.style.display = 'none' when the session starts and back to default when it ends renderer.domElement.style.display = ''

  // Add an event listener to handle the XRSessionStarted event
  useXREvent("connected", () => {
    gl.domElement.style.display = "none";
    console.log("XR session started!");
  });

  // Add an event listener to handle the XRSessionEnded event
  useXREvent("disconnected", () => {
    gl.domElement.style.display = "block";
    console.log("XR session ended!");
  });

  const texture = new TextureLoader().load(imageUrl);

  return (
    <mesh ref={meshRef}>
      <planeBufferGeometry args={[0.01, 0.01]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

interface GalleryARProps {
  imageUrl: string;
  onClose: () => void;
}

const GalleryAR: React.FC<GalleryARProps> = ({ imageUrl, onClose }) => {
  return (
    <>
      <ARButton onClick={onClose} />
      <Canvas>
        <XR
          foveation={0}
          referenceSpace="local"
          onSessionStart={(event) => {
            // Handle the start of the XR session
          }}
          onSessionEnd={(event) => {
            // Handle the end of the XR session
          }}
        >
          <ambientLight />
          <pointLight position={[10, 10, 10]} />

          <ARScene imageUrl={imageUrl} />
        </XR>
      </Canvas>
    </>
  );
};

export default GalleryAR;
