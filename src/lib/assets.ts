/**
 * Central asset registry.
 * All static assets live under /public/assets/** and are referenced through
 * these constants so paths are typed, discoverable, and easy to swap.
 */

const BASE = "/assets";

export const assets = {
  icons: {
    logo: `${BASE}/icons/logo.png`,
  },
  illustrations: {
    vpsServers: `${BASE}/illustrations/vps-servers.svg`,
    globalNetwork: `${BASE}/illustrations/global-network.svg`,
  },
  screenshots: {
    heroApp: `${BASE}/screenshots/hero-app.svg`,
    vpsHero: `${BASE}/screenshots/vps-hero.svg`,
    dashboard: `${BASE}/screenshots/dashboard.svg`,
    panel: `${BASE}/screenshots/hosting-panel.svg`,
  },
  gifs: {
    deploy: `${BASE}/gifs/instant-deploy.svg`,
    metrics: `${BASE}/gifs/live-metrics.svg`,
  },
  images: {
    ogCover: `${BASE}/images/og-cover.svg`,
    dataCenter: `${BASE}/images/datacenter.jpg`,
  },
} as const;

export type AssetKey = typeof assets;
