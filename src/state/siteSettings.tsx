import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSettingsMap } from "../lib/db";

export type SiteSettings = {
  site_name: string;
  logo_url: string;
  about_title: string;
  about_text: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
  instagram_url: string;
  facebook_url: string;
  admin_whatsapp: string;
};

const DEFAULTS: SiteSettings = {
  site_name: "Nawasena Machinery",
  logo_url: "",
  about_title: "Tentang Kami",
  about_text: "",
  footer_address: "",
  footer_phone: "",
  footer_email: "",
  instagram_url: "",
  facebook_url: "",
  admin_whatsapp: "6281234567890"
};

const KEYS = Object.keys(DEFAULTS) as (keyof SiteSettings)[];

type Ctx = { settings: SiteSettings; loading: boolean; refresh: () => Promise<void> };
const SiteSettingsCtx = createContext<Ctx | null>(null);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const map = await getSettingsMap(KEYS as unknown as string[]);
      const next: SiteSettings = { ...DEFAULTS };
      for (const k of KEYS) next[k] = (map[k] ?? DEFAULTS[k]) as any;
      setSettings(next);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ settings, loading, refresh }), [settings, loading]);
  return <SiteSettingsCtx.Provider value={value}>{children}</SiteSettingsCtx.Provider>;
}

export function useSiteSettings() {
  const v = useContext(SiteSettingsCtx);
  if (!v) throw new Error("useSiteSettings must be used inside SiteSettingsProvider");
  return v;
}
