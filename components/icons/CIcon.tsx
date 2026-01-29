// components/icons/CIcon.tsx
import React from "react";

export function CIcon({ size = 16 }: { size?: number }) {
  return React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 128 128",
      xmlns: "http://www.w3.org/2000/svg",
    },
    React.createElement("circle", {
      cx: 64,
      cy: 64,
      r: 60,
      fill: "#03599C",
    }),
    React.createElement("path", {
      d: "M86 42c-6-6-14-9-22-9-17 0-31 14-31 31s14 31 31 31c8 0 16-3 22-9l-9-9c-3 3-8 5-13 5-9 0-16-8-16-18s7-18 16-18c5 0 10 2 13 5l9-9z",
      fill: "white",
    })
  );
}
