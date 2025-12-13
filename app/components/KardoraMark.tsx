import React from "react";

type Props = {
  className?: string;
};

export default function KardoraMark({ className }: Props) {
  return (
    <svg
      className={className}
      width="44"
      height="47"
      viewBox="0 0 44 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "43.837px", height: "46.359px", aspectRatio: "43.84 / 46.36" }}
    >
      <path
        d="M0 23.1794C0 9.8706 9.3605 0 21.9184 0C34.4763 0 43.8368 9.88493 43.8368 23.1794C43.8368 36.4739 34.4167 46.3589 21.9184 46.3589C9.42007 46.3589 0 36.4095 0 23.1794ZM32.7286 23.1794C32.7286 16.0737 28.2404 11.1528 21.925 11.1528C15.6096 11.1528 11.1214 16.0737 11.1214 23.1794C11.1214 30.2851 15.603 35.2061 21.925 35.2061C28.247 35.2061 32.7286 30.2851 32.7286 23.1794Z"
        fill="rgba(34, 34, 34, 0.05)"
      />
      <path
        d="M0 23.1794C0 9.8706 9.3605 0 21.9184 0C34.4763 0 43.8368 9.88493 43.8368 23.1794C43.8368 36.4739 34.4167 46.3589 21.9184 46.3589C9.42007 46.3589 0 36.4095 0 23.1794ZM32.7286 23.1794C32.7286 16.0737 28.2404 11.1528 21.925 11.1528C15.6096 11.1528 11.1214 16.0737 11.1214 23.1794C11.1214 30.2851 15.603 35.2061 21.925 35.2061C28.247 35.2061 32.7286 30.2851 32.7286 23.1794Z"
        fill="url(#paint0_linear_mark)"
      />
      <defs>
        <linearGradient id="paint0_linear_mark" x1="21.9184" y1="46.3589" x2="21.9184" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
      </defs>
    </svg>
  );
}
