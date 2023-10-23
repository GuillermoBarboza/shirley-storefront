import React from "react";
import axios from "axios";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  XR,
  useXREvent,
  XREvent,
  XRManagerEvent,
  Controllers,
  Hands,
} from "@react-three/xr";
import { TextureLoader, Texture } from "three";
import { Plane } from "@react-three/drei";

function ARScene({ imageUrl }: { imageUrl: string }): JSX.Element {
  const { gl } = useThree();
  const meshRef = React.useRef<THREE.Mesh>(null!);

  useXREvent("connected", () => {
    gl.domElement.style.display = "none";
    console.log("XR session started!");
  });

  useXREvent("disconnected", () => {
    gl.domElement.style.display = "block";
    console.log("XR session ended!");
  });

  const texture = new TextureLoader().load("./shirley.jpeg");

  /*  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime();
    }
  }); */

  return (
    <Plane
      ref={meshRef}
      args={[1, 1]}
      rotation={[0, 0, 0]}
      position={[0, 1, -2]}
    >
      {texture && <meshStandardMaterial map={texture} />}
    </Plane>
  );
}

interface GalleryARProps {
  imageUrl: string;
}

const GalleryAR: React.FC<GalleryARProps> = ({ imageUrl }) => {
  return (
    <>
      <Canvas>
        <XR
          foveation={0}
          onSessionStart={(event: XREvent<XRManagerEvent>) => {}}
          onSessionEnd={(event: XREvent<XRManagerEvent>) => {}}
        >
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <ARScene imageUrl={imageUrl} />
          <Controllers />
          <Hands />
        </XR>
      </Canvas>
    </>
  );
};

export default GalleryAR;
