import React from "react";

type Props = {
  className?: string;
};

export default function CupIcon({ className }: Props) {
  return (
    <svg width="134" height="228" viewBox="0 0 134 228" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M2.5 44.5L25.352 173.355C27.9103 186.273 39.2646 195.5 52.4334 195.5H81.3916C94.5269 195.5 105.86 186.321 108.455 173.454L131.5 44.5"
        stroke="#507F70"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 186C25 186 39.1176 195.5 66.8235 195.5C94.5294 195.5 108.5 186 108.5 186"
        stroke="white"
        strokeWidth="11"
        strokeLinecap="round"
      />
    </svg>
  );
}
