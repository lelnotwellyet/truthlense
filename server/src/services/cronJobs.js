import cron from 'node-cron';
import { fetchAllTopics } from './newsService.js';
import logger from '../utils/logger.js';

/**
 * Start all scheduled cron jobs.
 */
export function startCronJobs() {
  // Fetch news every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.info('[CRON] News fetch job started');
    try {
      const count = await fetchAllTopics();
      logger.info(`[CRON] News fetch completed. ${count} new articles.`);
    } catch (err) {
      logger.error('[CRON] News fetch failed:', err.message);
    }
  });

  logger.info('[CRON] Scheduled jobs started (news fetch every 30 min)');
}
