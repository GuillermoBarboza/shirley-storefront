import React from "react";
import axios from "axios";
import { Canvas, useThree } from "@react-three/fiber";
import {
  XR,
  useXREvent,
  XREvent,
  XRManagerEvent,
  Controllers,
  Hands,
  useHitTest,
} from "@react-three/xr";
import { TextureLoader, Euler, Quaternion } from "three";
import { Plane } from "@react-three/drei";

function ARScene({ imageUrl }: { imageUrl: string }): JSX.Element {
  const { gl } = useThree();
  const meshRef = React.useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = React.useState<THREE.Texture>();

  useHitTest((hitMatrix, hit) => {
    const euler = new Euler(0, Math.PI, 0);
    const quaternion = new Quaternion().setFromEuler(euler);
    console.log(hit);
    hitMatrix.decompose(
      meshRef.current.position,
      quaternion,
      meshRef.current.scale
    );
  });

  useXREvent("connected", () => {
    gl.domElement.style.display = "none";
    console.log("XR session started!");
  });

  useXREvent("disconnected", () => {
    gl.domElement.style.display = "block";
    console.log("XR session ended!");
  });

  React.useEffect(() => {
    console.log(imageUrl);
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const loader = new TextureLoader();
        loader.load(url, (texture) => {
          setTexture(texture);
          URL.revokeObjectURL(url);
        });
      });
  }, [imageUrl]);

  React.useEffect(() => {
    console.log(texture);
  }, [texture]);

  return (
    <Plane
      ref={meshRef}
      args={[1, 1]}
      /*  rotation={[0, 0, 0]}
      position={[0, 1, -2]} */
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
