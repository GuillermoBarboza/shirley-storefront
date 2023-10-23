import GalleryAR from "./components/GalleryAR/GalleryAR";

import { ARButton } from "@react-three/xr";

function Gallery() {
  return (
    <div>
      <ARButton />
      <div>
        <GalleryAR imageUrl={"url"} />
      </div>
    </div>
  );
}

export default Gallery;
