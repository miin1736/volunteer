import fs from "node:fs/promises";
import path from "node:path";

/**
 * Appends a JSON line to a log file.
 * Creates the file if it doesn't exist.
 * 
 * @param filePath - Path to the log file
 * @param payload - Data to append as a JSON line
 */
export async function appendJsonl(filePath: string, payload: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const line = JSON.stringify(payload) + "\n";
  await fs.appendFile(filePath, line, "utf-8");
}
