import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e1ecf1",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 96,
            color: "#1e4d6b",
            transform: "translateY(-4px)",
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size }
  );
}
