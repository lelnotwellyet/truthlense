import axios from 'axios';
import { supabaseAdmin } from '../config/supabase.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const TOPICS = ['general', 'technology', 'business', 'science', 'health', 'sports', 'entertainment'];

const CURRENTS_BASE_URL = 'https://api.currentsapi.services/v1';

/**
 * Fetch news articles from Currents API for a specific topic.
 * @param {string} topic — category to fetch
 * @param {string|null} country — country code (e.g. 'in') or null for global
 */
export async function fetchNews(topic = 'general', country = null) {
  try {
    if (!env.CURRENTS_API_KEY) {
      logger.warn('CURRENTS_API_KEY not configured, skipping news fetch');
      return [];
    }

    const params = {
      apiKey: env.CURRENTS_API_KEY,
      language: 'en',
      category: topic,
    };

    if (country) {
      params.country = country;
    }

    const { data } = await axios.get(`${CURRENTS_BASE_URL}/latest-news`, {
      params,
      timeout: 15000,
    });

    return data.news || [];
  } catch (err) {
    logger.error(`Failed to fetch news for topic ${topic} (country: ${country || 'global'}):`, err.message);
    return [];
  }
}

/**
 * Process and store articles, avoiding duplicates.
 * @param {Array} articles — articles from Currents API
 * @param {string} topic — topic/category name
 * @param {string} country — 'global' or country code like 'in'
 */
export async function processAndStoreArticles(articles, topic, country = 'global') {
  let inserted = 0;

  for (const article of articles) {
    try {
      if (!article.url || !article.title) continue;

      // Check for duplicates
      const { data: existing } = await supabaseAdmin
        .from('articles')
        .select('id')
        .eq('url', article.url)
        .single();

      if (existing) continue;

      // Extract source domain
      const sourceName = article.author || 'Unknown';
      let sourceDomain = '';
      try {
        sourceDomain = new URL(article.url).hostname.replace('www.', '');
      } catch { /* ignore */ }

      // Look up source credibility
      const { data: source } = await supabaseAdmin
        .from('sources')
        .select('id, credibility_score')
        .eq('domain', sourceDomain)
        .single();

      const record = {
        title: article.title,
        description: article.description || '',
        content: article.description || '',
        url: article.url,
        image_url: article.image || null,
        source_id: source?.id || null,
        source_name: sourceName,
        author: article.author || null,
        topic: topic === 'general' ? 'politics' : topic,
        published_at: article.published || new Date().toISOString(),
        credibility_score: source?.credibility_score || null,
        country: country,
      };

      const { error } = await supabaseAdmin.from('articles').insert(record);
      if (!error) inserted++;
    } catch (err) {
      logger.error(`Failed to store article: ${article.title}`, err.message);
    }
  }

  return inserted;
}

/**
 * Fetch news for all topics — both global and India.
 */
export async function fetchAllTopics() {
  logger.info('Starting news fetch for all topics...');
  let totalInserted = 0;

  for (const topic of TOPICS) {
    // Fetch global news (no country filter)
    const globalArticles = await fetchNews(topic, null);
    if (globalArticles.length > 0) {
      const count = await processAndStoreArticles(globalArticles, topic, 'global');
      totalInserted += count;
      logger.info(`Fetched ${globalArticles.length} global articles for "${topic}", inserted ${count} new`);
    }

    // Fetch India-specific news
    const indiaArticles = await fetchNews(topic, 'in');
    if (indiaArticles.length > 0) {
      const count = await processAndStoreArticles(indiaArticles, topic, 'in');
      totalInserted += count;
      logger.info(`Fetched ${indiaArticles.length} India articles for "${topic}", inserted ${count} new`);
    }
  }

  logger.info(`News fetch complete. Total new articles: ${totalInserted}`);
  return totalInserted;
}
