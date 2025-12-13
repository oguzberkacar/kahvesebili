import React from "react";

type Props = {
  width?: string;
  height?: string;
  rotation?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function IceCube({ width = "40px", height = "40px", rotation = 0, scale = 1, className, style }: Props) {
  return (
    <div
      className={`absolute transition-all duration-1000 ease-in-out ${className}`}
      style={{
        width,
        height,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        borderRadius: "11.487px",
        background: "#7AE1BF",
        ...style,
      }}
    />
  );
}
