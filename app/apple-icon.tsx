import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 120,
          background: "#18332F", // color-secondary
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#AFEADC", // color-fi
          borderRadius: "0px",
          fontWeight: 800,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 8H19C20.1046 8 21 8.89543 21 10V13C21 14.1046 20.1046 15 19 15H18V8ZM18 8V16C18 18.2091 16.2091 20 14 20H8C5.79086 20 4 18.2091 4 16V8C4 5.79086 5.79086 4 8 4H14C16.2091 4 18 5.79086 18 8ZM6 22H16"
            stroke="#AFEADC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported dimensions
      ...size,
    }
  );
}
