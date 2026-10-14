import { useLanguage } from "../../context/LanguageContext";
import { useId } from "react";
import { Fragment } from "react";

export function Crystal() {
  const { t } = useLanguage();

  const id = useId().replace(/:/g, "");
  return (
    <svg
      className="crystal"
      viewBox="0 0 500 340"
      role="img"
      aria-label={t("晶体封装示意", "Crystal package illustration")}
    >
      <defs>
        <linearGradient id={id + "t"} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f5f7f8" />
          <stop offset=".35" stopColor="#b8c5cf" />
          <stop offset=".56" stopColor="#e9f0f4" />
          <stop offset="1" stopColor="#8197aa" />
        </linearGradient>
        <linearGradient id={id + "s"} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#7f97a8" />
          <stop offset="1" stopColor="#2b414f" />
        </linearGradient>
        <linearGradient id={id + "g"}>
          <stop stopColor="#947142" />
          <stop offset=".5" stopColor="#e4cc8d" />
          <stop offset="1" stopColor="#ad894c" />
        </linearGradient>
      </defs>
      <ellipse
        cx="258"
        cy="277"
        rx="145"
        ry="19"
        fill="#607d94"
        opacity=".11"
      />
      <path d="m80 155 220-79 124 76-220 84Z" fill="#20333f" />
      <path d="M80 155v49l124 81v-49Z" fill="#2b4351" />
      <path d="m204 236 220-84v47l-220 86Z" fill="#152b3a" />
      {[0, 1, 2].map((n, index) => (
        <Fragment key={index}>
          <path
            d={
              "m" + (98 + n * 37) + " " + (218 + n * 24) + " 22 14v-25l-22-14Z"
            }
            fill={"url(#" + id + "g)"}
          />
          <path
            d={
              "m" + (225 + n * 65) + " " + (277 - n * 25) + " 32-13v-27l-32 13Z"
            }
            fill={"url(#" + id + "g)"}
          />
        </Fragment>
      ))}
      <path
        d="m89 140 213-77 111 69v33l-213 81L89 173Z"
        fill={"url(#" + id + "s)"}
      />
      <path
        d="m89 140 213-77 111 69-213 82Z"
        fill={"url(#" + id + "t)"}
        stroke="#d7e4ec"
        strokeWidth="2"
      />
      <path d="m105 139 196-70 94 61-195 75Z" fill="none" stroke="#8297a6" />
      <g transform="matrix(.87,-.32,.85,.53,170,143)" fill="#47657a">
        <text
          fontFamily="Georgia,serif"
          fontWeight="bold"
          fontSize="27"
          letterSpacing="2"
        >
          TAITIEN
        </text>
        <text y="29" fontFamily="monospace" fontSize="12" letterSpacing="3">
          FREQUENCY CONTROL
        </text>
      </g>
    </svg>
  );
}
