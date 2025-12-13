import React from "react";
import SmokeLeftIcon from "./SmokeLeftIcon";
import SmokeMiddleIcon from "./SmokeMiddleIcon";
import SmokeRightIcon from "./SmokeRightIcon";

type Props = {
  className?: string;
  fill?: string;
  style?: React.CSSProperties;
};

export default function SmokeIcon({ className, fill = "white", style }: Props) {
  // Split className to separate positioning/animation from internal layout
  return (
    <div className={className} style={{ width: "30px", height: "35px", ...style }}>
      <div className="relative w-full h-full">
        <SmokeLeftIcon className="absolute inset-0 w-full h-full" fill={fill} />
        <SmokeMiddleIcon className="absolute inset-0 w-full h-full" fill={fill} />
        <SmokeRightIcon className="absolute inset-0 w-full h-full" fill={fill} />
      </div>
    </div>
  );
}
