
import { defineConfig, devices } from "@playwright/test";
import process from "node:process";

const isCI = Boolean(process.env.CI);

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    reporter: "list",

    use: {
        baseURL: "http://localhost:3100",
        trace: "retain-on-failure",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    webServer: {
        command: isCI
            ? "pnpm --filter web exec next start --hostname localhost --port 3100"
            : "pnpm --filter web exec next dev --hostname localhost --port 3100",
        url: "http://localhost:3100",
        reuseExistingServer: false,
        timeout: 180_000,
    },
});
