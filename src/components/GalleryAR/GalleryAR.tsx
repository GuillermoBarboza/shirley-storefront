import React from "react";
import axios from "axios";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  XR,
  useXREvent,
  XREvent,
  XRManagerEvent,
  Controllers,
} from "@react-three/xr";
import { TextureLoader, Texture } from "three";
import { Plane } from "@react-three/drei";

function ARScene({ imageUrl }: { imageUrl: string }): JSX.Element {
  const { gl } = useThree();
  const meshRef = React.useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = React.useState<Texture | null>(null);

  useXREvent("connected", () => {
    gl.domElement.style.display = "none";
    console.log("XR session started!");
  });

  useXREvent("disconnected", () => {
    gl.domElement.style.display = "block";
    console.log("XR session ended!");
  });

  React.useEffect(() => {
    const loadTexture = async () => {
      const response = await axios.get(imageUrl, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const loader = new TextureLoader();
      loader.load(url, (texture) => {
        setTexture(texture);
        URL.revokeObjectURL(url);
      });
    };

    loadTexture();
  }, [imageUrl]);

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
        </XR>
      </Canvas>
    </>
  );
};

export default GalleryAR;
