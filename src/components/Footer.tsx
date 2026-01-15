import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { useSiteSettings } from "../state/siteSettings";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

function splitName(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { a: name || "Nawasena", b: "" };
  return { a: parts[0], b: parts.slice(1).join(" ") };
}

function clampText(text: string, max = 320) {
  const t = (text || "").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

export function Footer() {
  const { settings } = useSiteSettings();

  const siteName = settings.site_name || "Nawasena Machinery";
  const { a, b } = useMemo(() => splitName(siteName), [siteName]);

  const about =
    settings.about_text?.trim()
      ? settings.about_text
      : "Produsen mesin tepat guna untuk mendukung pertumbuhan UMKM hingga industri.";
  const aboutShort = clampText(about, 380);

  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <Container className="py-10">
        <div className="grid gap-10 md:grid-cols-12">
          {/* LEFT: brand + desc (justify) */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs font-semibold text-white/80">
                    NM
                  </div>
                )}
              </div>

              <div className="text-sm font-semibold tracking-tight">
                <span className="text-white">{a}</span>{" "}
                <span className="text-emerald-400">{b}</span>
              </div>
            </div>

            <p className="mt-4 text-justify text-sm leading-relaxed text-white/60">
              {aboutShort}
            </p>
          </div>

          {/* LINKS */}
          <div className="md:col-span-3">
            <div className="text-sm font-semibold text-white">Tautan</div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
              <Link to="/katalog" className="hover:text-white">Katalog</Link>
              <Link to="/cart" className="hover:text-white">Pemesanan</Link>
              <Link to="/admin/login" className="hover:text-white">Admin Panel</Link>
            </div>
          </div>

          {/* CONTACT */}
          <div className="md:col-span-4">
            <div className="text-sm font-semibold text-white">Kontak</div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              {settings.footer_address ? (
                <div className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-emerald-300/80" />
                  <div className="leading-relaxed">{settings.footer_address}</div>
                </div>
              ) : null}
              {settings.footer_phone ? (
                <div className="flex gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-emerald-300/80" />
                  <div>{settings.footer_phone}</div>
                </div>
              ) : null}
              {settings.footer_email ? (
                <div className="flex gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-emerald-300/80" />
                  <div>{settings.footer_email}</div>
                </div>
              ) : null}
            </div>

            {(settings.instagram_url || settings.facebook_url) ? (
              <>
                <div className="mt-5 text-sm font-semibold text-white">Social Media</div>
                <div className="mt-3 flex gap-2">
                  {settings.instagram_url ? (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  ) : null}
                  {settings.facebook_url ? (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
