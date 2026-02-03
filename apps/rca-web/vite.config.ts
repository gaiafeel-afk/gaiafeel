import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function getGithubPagesBase(): string {
  if (!process.env.GITHUB_ACTIONS || !process.env.GITHUB_REPOSITORY) {
    return "/";
  }

  const repoName = process.env.GITHUB_REPOSITORY.split("/")[1];
  if (!repoName) {
    return "/";
  }

  // User/organization pages repositories must be served from root.
  if (repoName.endsWith(".github.io")) {
    return "/";
  }

  return `/${repoName}/`;
}

export default defineConfig({
  plugins: [react()],
  base: getGithubPagesBase(),
});
