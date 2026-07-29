import { UserRound } from "lucide-react";
import React from "react";

interface CustomImageProps {
  src?: string;
  size?: number;
  alt?: string;
  userImgaeClass?: string;
}

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  size = 80,
  alt = "avatar",
  userImgaeClass,
}) => {
  const style = {
    width: size,
    height: size,
  };
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className={`rounded-full border border-gray-300 object-cover ${userImgaeClass} `}
      />
    );
  }
  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full border border-gray-300 bg-bmw-surface"
    >
      <UserRound className="text-gray-500 w-2/3 h-2/3" />
    </div>
  );
};

export default CustomImage;

// <div
//   style={style}
//   className="overflow-hidden rounded-full border border-gray-300 bg-white"
// >
//   <img
//     src={src}
//     alt={alt}
//     className={`w-full h-full ${userImgaeClass ?? ""}`}
//   />
// </div>
