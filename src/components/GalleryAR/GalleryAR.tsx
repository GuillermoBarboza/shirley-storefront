import { Canvas } from "@react-three/fiber";
//@ts-ignore
import { XR, Hands, Controllers } from "@react-three/xr";
import { useTexture } from "@react-three/drei";

function ARScene({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl); // Load the image as a texture

  return (
    <group>
      <mesh>
        <planeBufferGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

function GalleryAR({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
      <Canvas style={{ width: "100%", height: "100%" }}>
        <ambientLight />
        <XR>
          <Hands />
          <Controllers />
          <ARScene imageUrl={imageUrl} />
        </XR>
      </Canvas>
    </div>
  );
}

export default GalleryAR;
