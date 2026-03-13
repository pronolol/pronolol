import "dotenv/config"
import { writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { openApiDocument } from "./openapi"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, "../openapi.json")

writeFileSync(outPath, JSON.stringify(openApiDocument, null, 2))
console.log(`OpenAPI spec written to ${outPath}`)
