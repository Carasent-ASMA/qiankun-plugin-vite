import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

type PackageJson = {
  name: string;
  version: string;
};

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as PackageJson;

const banner = [
  "/*!",
  ` * ${packageJson.name}.js v${packageJson.version}`,
  ` * (c) 2022-${new Date().getFullYear()} IE`,
  " * Released under the MIT License.",
  " * Inspired by vite-plugin-qiankun (https://github.com/tengmaoqing/vite-plugin-qiankun).",
  " */",
].join("\n");

const entry = {
  index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
  helper: fileURLToPath(new URL("./src/helper.ts", import.meta.url)),
};

const external = ["cheerio"];

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry,
      formats: ["es"],
    },
    rollupOptions: {
      external,
      output: {
        banner,
        dir: "dist",
        entryFileNames: "[name].js",
      },
    },
  },
  plugins: [
    dts({
      entryRoot: "src",
      include: ["src/index.ts", "src/helper.ts", "type/**/*.d.ts"],
      insertTypesEntry: false,
      outDir: ["dist"],
      rollupTypes: false,
    }),
  ],
});
