import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Version information for the application
 */
export interface VersionInfo {
	/** Semantic version (e.g., "3.2.1") */
	version: string;
	/** Build timestamp in ISO format (YYYY-MM-DDTHH:mm:ssZ) */
	buildTimestamp: string;
}

/**
 * Stored version info generated during Publish NPM workflow
 */
interface StoredVersionInfo {
	version: string;
	buildTimestamp: string;
}

/**
 * Get version information from version.json or fallback to package.json
 *
 * **Priority:**
 * 1. Try to read from `version.json` (generated during Publish NPM workflow)
 * 2. Fallback to `package.json` version + `package.json` modification date
 *
 * @returns Version information with version and build date
 */
export function getVersionInfo(): VersionInfo {
	// Try to read version.json first (generated during Publish NPM workflow)
	const versionJsonPath = join(__dirname, "version.json");

	if (existsSync(versionJsonPath)) {
		try {
			const versionJson = JSON.parse(readFileSync(versionJsonPath, "utf-8")) as StoredVersionInfo;
			return {
				version: versionJson.version,
				buildTimestamp: versionJson.buildTimestamp,
			};
		} catch (error) {
			// Fall through to fallback if version.json is malformed
			console.error("Warning: Failed to parse version.json, using fallback", error);
		}
	}

	// Fallback: Read version from package.json and use its modification timestamp
	const packageJsonPath = join(__dirname, "../package.json");
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as { version: string };
	const packageStats = statSync(packageJsonPath);

	// Use full ISO timestamp (with time)
	const buildTimestamp = packageStats.mtime.toISOString();

	return {
		version: packageJson.version,
		buildTimestamp,
	};
}

/**
 * Format version info as a string for display in logs
 *
 * @param versionInfo - Version information to format
 * @returns Formatted string (e.g., "v3.2.1 (2025-12-17T14:35:22Z)")
 */
export function formatVersionInfo(versionInfo: VersionInfo): string {
	// Format timestamp as "YYYY-MM-DD HH:mm:ss UTC" for better readability
	const timestamp = versionInfo.buildTimestamp;
	const date = timestamp.substring(0, 10); // YYYY-MM-DD
	const time = timestamp.substring(11, 19); // HH:mm:ss

	return `v${versionInfo.version} (${date} ${time} UTC)`;
}
