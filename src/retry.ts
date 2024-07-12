// eslint-disable-next-line no-restricted-imports
import pRetry from "p-retry";

// Set some default retry options without changing the implementation
const retry: typeof pRetry = (input, options) =>
  pRetry(input, { retries: 2, ...options });

export default retry;
