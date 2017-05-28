/* eslint-env node */
module.exports = {
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  "launch_in_ci": [
    "Chrome Canary"
  ],
  "launch_in_dev": [
    "Chrome Canary"
  ],
  "browser_args": {
    "Chrome Canary": ["--headless", "--disable-gpu", "--remote-debugging-port=9222"],
  }
};
