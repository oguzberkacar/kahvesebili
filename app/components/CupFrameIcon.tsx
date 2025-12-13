import React from "react";

type Props = {
  className?: string;
  stroke?: string;
  strokeWidth?: number | string;
};

export default function CupFrameIcon({ className, stroke = "rgba(255, 255, 255, 0.25)", strokeWidth = 5.744 }: Props) {
  return (
    <svg width="231" height="276" viewBox="0 0 231 276" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M228.153 0.304688L202.887 237.184C200.707 257.622 183.463 273.125 162.908 273.125H68.0993C47.5452 273.125 30.3009 257.622 28.121 237.184L2.8556 0.304688"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
