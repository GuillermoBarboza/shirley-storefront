import { useLocation, useNavigate } from "react-router-dom";
import GalleryAR from "./components/GalleryAR/GalleryAR";
import { ARButton } from "@react-three/xr";

function Gallery() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the URL query parameter
  const urlParam = new URLSearchParams(location.search).get("url");

  // If no URL parameter is provided, redirect back to "/"
  if (!urlParam) {
    navigate("/");
    return null;
  }

  return (
    <div>
      <ARButton />
      <div>
        <GalleryAR imageUrl={urlParam} />
      </div>
    </div>
  );
}

export default Gallery;
