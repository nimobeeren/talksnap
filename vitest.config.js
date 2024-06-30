import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: "**/*.{test,eval}.[jt]s",
  },
});
