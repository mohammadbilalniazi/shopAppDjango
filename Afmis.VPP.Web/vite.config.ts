import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default ({ mode }) =>
{
  const isDjangoIsland = mode === "django";

  return (
  defineConfig({
    plugins: [isDjangoIsland ? null : eslint(), react()].filter(Boolean),
    server: {
      port: 3000,
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: isDjangoIsland
      ? {
          outDir: path.resolve(__dirname, "../static/assets/react"),
          emptyOutDir: false,
          lib: {
            entry: path.resolve(__dirname, "src/entries/billOrganizationSelect.tsx"),
            name: "BillOrganizationSelect",
            formats: ["iife"],
            fileName: () => "bill-organization-select.js",
          },
          rollupOptions: {
            output: {
              assetFileNames: (assetInfo) =>
                assetInfo.name?.endsWith(".css")
                  ? "bill-organization-select.css"
                  : "[name][extname]",
            },
          },
        }
      : {
          outDir: mode === "afmis" ? "Z:" : "dist",
          emptyOutDir: true,
        },
  })
  );
};
