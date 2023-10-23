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
import { TextureLoader } from "three";
import { Plane } from "@react-three/drei";

function ARScene({ imageUrl }: { imageUrl: string }): JSX.Element {
  const { gl } = useThree();
  const meshRef = React.useRef<THREE.Mesh>(null!);
  const [textureUrl, setTextureUrl] = React.useState<string | null>(null);

  useXREvent("connected", () => {
    gl.domElement.style.display = "none";
    console.log("XR session started!");
  });

  useXREvent("disconnected", () => {
    gl.domElement.style.display = "block";
    console.log("XR session ended!");
  });

  React.useEffect(() => {
    const fetchImage = async () => {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const blob = new Blob([response.data], { type: "image/jpeg" });
      const blobUrl = URL.createObjectURL(blob);
      setTextureUrl(blobUrl);
    };

    fetchImage();
  }, [imageUrl]);

  const texture = textureUrl ? new TextureLoader().load(textureUrl) : null;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime();
    }
  });

  return (
    <Plane
      ref={meshRef}
      args={[1, 1]}
      rotation={[0, 0, 0]}
      position={[0, 0, 0.06]}
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
