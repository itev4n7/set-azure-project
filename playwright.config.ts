import {defineConfig, devices} from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './playwright/tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['line'], ['junit', {outputFile: 'test-results/junit-results.xml'}], ['html', {
        open: 'never',
        outputFolder: 'test-html-report/'
    }]],
    expect: {
        timeout: 15 * 1000,
    },
    timeout: 30000,
    globalTimeout: 2 * 60 * 1000,
    use: {
        headless: !!process.env.CI,
        actionTimeout: 30 * 1000,
        navigationTimeout: 30 * 1000,
        testIdAttribute: 'pw-data-id',
        viewport: {width: 1544, height: 854},
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: {
            mode: 'retain-on-failure',
            size: {width: 1280, height: 720},
        },
        launchOptions: {
            slowMo: 500,
            downloadsPath: './downloads',
        },
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
    ],
});
