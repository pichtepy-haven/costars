import React from "react";
import { event, socials } from "../data.js";
import { useT } from "../i18n.jsx";

const LINKS = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["email", "Email"],
];

/** Musicians on a glowing stage, then the closing line and social links. */
export default function SiteFooter({ compact = false }) {
  const { t, loc } = useT();
  const links = LINKS.filter(([key]) => socials[key]);
  return (
    <footer className={`site-footer ${compact ? "site-footer--compact" : ""}`}>
      {!compact && (
        <div className="footer-stage" aria-hidden="true">
          <div className="floor-glow" />
          <img src="/images/brand/musicians.svg" alt="" />
        </div>
      )}
      <div className="footer-bottom">
        <div className="footer-closing wrap">
          <div className="footer-closing__text">
            <p className="display footer-name">{loc(event, "name")}</p>
            {!compact && (
              <p className="footer-small">{loc(event, "footerText")}</p>
            )}
          </div>
          {links.length > 0 && (
            <nav className="footer-links" aria-label="CoStars">
              {links.map(([key, label]) => (
                <a
                  key={key}
                  href={socials[key]}
                  {...(socials[key].startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {key === "email" ? t("email") : label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
