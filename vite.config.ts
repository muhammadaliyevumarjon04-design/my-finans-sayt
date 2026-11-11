import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// GitHub Pages project sites live under /<repository>/; user/org sites use /.
export default defineConfig(({ mode }) => {
  const repository = process.env.GITHUB_REPOSITORY;
  const [owner, repo] = repository?.split("/") ?? [];
  const isUserOrOrgSite = Boolean(owner && repo === `${owner}.github.io`);
  const base = process.env.GITHUB_ACTIONS
    ? isUserOrOrgSite
      ? "/"
      : `/${repo ?? ""}/`
    : "/";

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
