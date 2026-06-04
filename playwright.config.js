export default {
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure'
  }
};
