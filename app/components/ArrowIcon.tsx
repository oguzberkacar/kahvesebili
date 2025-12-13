import React from "react";

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export default function ArrowIcon({ className, style }: Props) {
  return (
    <svg
      className={className}
      width="84"
      height="51"
      viewBox="0 0 84 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "84px", height: "51px", aspectRatio: "84 / 51", ...style }}
    >
      <path
        d="M8.5 42.5L42 8.5L75.5 42.5"
        stroke="#18332F"
        strokeWidth="17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
