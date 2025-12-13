import React from "react";

type Props = {
  className?: string;
  fill?: string;
  heightRaw?: string;
};

export default function LiquidSvg({ className, fill = "#ffffff", heightRaw = "0%" }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="191" height="227" viewBox="0 0 191 227" fill="none" className={className}>
      <defs>
        <linearGradient id="coffeeGradient" x1="95.5" y1="0" x2="95.5" y2="227" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9C7C59" />
          <stop offset="1" stopColor="#5D4037" />
        </linearGradient>
      </defs>
      <mask
        id="mask0_2125_296"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="1"
        y="-1"
        width="188"
        height="228"
      >
        <path
          d="M48.2244 226.252H141.955C155.924 226.252 167.637 215.7 169.089 201.806L188.854 12.681C189.562 5.90145 184.245 -0.00012207 177.429 -0.00012207H12.7503C5.93375 -0.00012207 0.616776 5.90145 1.32529 12.681L21.0901 201.806C22.5421 215.7 34.2547 226.252 48.2244 226.252Z"
          fill="#FF0000"
        />
      </mask>
      <g mask="url(#mask0_2125_296)">
        <rect
          x="-18.219"
          y={227}
          width="225.297"
          height="272.82"
          rx="15"
          fill={fill}
          style={{
            transform: `translateY(-${heightRaw})`,
            transition: "transform 1s ease-in-out",
          }}
        />
      </g>
    </svg>
  );
}
