import { startServer } from "./app.js";
import { logger } from "./utils/logger.js";

startServer().catch((err) => {
  logger.fatal({ err }, "Failed to start Saaya AI API");
  process.exit(1);
});
