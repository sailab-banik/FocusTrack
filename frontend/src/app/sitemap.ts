import type { MetadataRoute } from "next";
import {
  PRIVACY_PATH,
  SIGN_UP_PATH,
  WELCOME_PATH,
} from "@/features/auth/routes";
import { SITE_URL } from "@/features/search/site-url";

// Only the public pages; everything else redirects signed-out visitors here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [WELCOME_PATH, SIGN_UP_PATH, PRIVACY_PATH].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
