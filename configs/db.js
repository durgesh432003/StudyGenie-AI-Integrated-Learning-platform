import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const DATABASE_URL = "postgresql://neondb_owner:npg_Z7eQodKErL8C@ep-delicate-queen-a8nndo95-pooler.eastus2.azure.neon.tech/ai-study-material-gen?sslmode=require";
const client = neon(DATABASE_URL);        
export const db = drizzle(client);
