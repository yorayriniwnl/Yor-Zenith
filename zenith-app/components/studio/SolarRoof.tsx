"use client";

import { useId } from "react";

export default function SolarRoof({
  panels = 12,
  dark = false,
}: {
  panels?: number;
  dark?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const visiblePanels = Math.min(16, Math.max(1, panels));

  return (
    <svg
      viewBox="0 0 620 380"
      fill="none"
      className={`solar-roof ${dark ? "solar-roof-dark" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-roof`}
          x1="160"
          y1="100"
          x2="480"
          y2="290"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={dark ? "#536456" : "#fcfff1"} />
          <stop offset="1" stopColor={dark ? "#263c34" : "#c9d3ba"} />
        </linearGradient>
        <linearGradient
          id={`${id}-panel`}
          x1="0"
          y1="0"
          x2="36"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#365c50" />
          <stop offset="1" stopColor="#132d27" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop stopColor="#e3f7a1" stopOpacity=".48" />
          <stop offset="1" stopColor="#d8efa3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="452" cy="87" r="83" fill={`url(#${id}-sun)`} />
      <g stroke={dark ? "#b8d8ae" : "#506749"} opacity=".13" strokeWidth=".8">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`a${i}`} d={`M${48 + i * 28} ${216 - i * 15} l256 139`} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={`b${i}`}
            d={`M${304 + i * 28} ${355 - i * 15} l-256 -139`}
          />
        ))}
        <path d="M48 216 306 76 568 214 304 355 48 216Z" />
      </g>
      <path
        d="M104 266 320 148 550 267 336 375Z"
        fill={dark ? "#000" : "#4c6343"}
        opacity=".12"
      />
      <path
        d="M147 188 321 285 321 331 147 235Z"
        fill={dark ? "#374a3c" : "#c5cfb6"}
        stroke={dark ? "#52644f" : "#a7b69a"}
      />
      <path
        d="M321 285 494 187 494 233 321 331Z"
        fill={dark ? "#1d3028" : "#a9b89e"}
        stroke={dark ? "#52644f" : "#92a48a"}
      />
      <path
        d="M141 183 320 84 501 183 321 285Z"
        fill={`url(#${id}-roof)`}
        stroke={dark ? "#83967a" : "#b2c29e"}
        strokeWidth="1.5"
      />
      <path
        d="M154 184 320 93 487 184 321 277Z"
        stroke={dark ? "#819474" : "#faffea"}
      />
      <g transform="matrix(.88 .49 -.92 .49 323 113)">
        {Array.from({ length: 16 }, (_, i) => (
          <g
            key={i}
            transform={`translate(${(i % 4) * 42} ${Math.floor(i / 4) * 34})`}
            className="roof-panel"
            style={{ opacity: i < visiblePanels ? 1 : 0.16 }}
          >
            <rect
              x="1"
              y="3"
              width="36"
              height="28"
              rx="1"
              fill="#12231d"
              opacity=".45"
            />
            <rect
              width="36"
              height="28"
              rx="1"
              fill={`url(#${id}-panel)`}
              stroke="#8bab86"
              strokeWidth="1.2"
            />
            <path
              d="M9 1v26M18 1v26M27 1v26M1 7h34M1 14h34M1 21h34"
              stroke="#9fbfa4"
              strokeOpacity=".28"
              strokeWidth=".6"
            />
            <path d="M1 1h34" stroke="#d9edba" strokeOpacity=".6" />
          </g>
        ))}
      </g>
      <path
        d="M351 310v25l102 55"
        stroke={dark ? "#ddf8a1" : "#657d44"}
        strokeWidth="1.5"
        strokeDasharray="4 5"
        className="solar-current"
      />
      <path
        d="M421 79 363 146M454 108 418 149M386 71 344 122"
        stroke={dark ? "#ddf8a1" : "#9ab65c"}
        strokeWidth="1.3"
        strokeDasharray="3 7"
        opacity=".6"
      />
      <g stroke={dark ? "#c7dfa3" : "#687e4c"} strokeWidth="1.2">
        <circle cx="452" cy="65" r="12" />
        <path d="M452 44v-5m0 52v-5m21-21h5m-52 0h5m6-15-4-4m38 38-4-4m0-30 4-4m-38 38 4-4" />
      </g>
      <g stroke={dark ? "#c0d5b5" : "#527048"} opacity=".45">
        <path d="M82 129h12m-6-6v12M535 287h12m-6-6v12M324 41h12m-6-6v12" />
        <path
          d="M118 211v29l188 104m205-131v28l-175 103"
          strokeDasharray="2 4"
        />
      </g>
      <circle cx="320" cy="285" r="4" fill={dark ? "#d9f99d" : "#769740"} />
    </svg>
  );
}
