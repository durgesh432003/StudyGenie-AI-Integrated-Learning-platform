import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_Z7eQodKErL8C@ep-delicate-queen-a8nndo95-pooler.eastus2.azure.neon.tech/ai-study-material-gen?sslmode=require",
  },
});