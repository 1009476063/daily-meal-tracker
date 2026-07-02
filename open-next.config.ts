import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({
  routePreloadingBehavior: "none",
});
export default config;
