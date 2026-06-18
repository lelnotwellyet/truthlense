import axios from 'axios';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const mlClient = axios.create({
  baseURL: env.ML_SERVICE_URL,
  timeout: 30000,
});

export async function verifyText(text, sourceName = null) {
  try {
    const payload = { text };
    if (sourceName) payload.source_name = sourceName;

    const { data } = await mlClient.post('/verify-text', payload, { timeout: 30000 });
    return data;
  } catch (err) {
    logger.error('ML verifyText failed:', err.message);
    return { error: err.message, status: 'ml_unavailable' };
  }
}

export async function verifyUrl(url) {
  try {
    const { data } = await mlClient.post('/verify-url', { url }, { timeout: 60000 });
    return data;
  } catch (err) {
    logger.error('ML verifyUrl failed:', err.message);
    return { error: err.message, status: 'ml_unavailable' };
  }
}

export async function verifyImage(imageBuffer, filename) {
  try {
    const FormData = (await import('form-data')).default || (await import('form-data'));
    const form = new FormData();
    form.append('file', imageBuffer, { filename, contentType: 'image/jpeg' });

    const { data } = await mlClient.post('/verify-image', form, {
      timeout: 60000,
      headers: form.getHeaders ? form.getHeaders() : { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    logger.error('ML verifyImage failed:', err.message);
    return { error: err.message, status: 'ml_unavailable' };
  }
}

export async function predict(text) {
  try {
    const { data } = await mlClient.post('/predict', { text });
    return data;
  } catch (err) {
    logger.error('ML predict failed:', err.message);
    return { error: err.message };
  }
}

export async function checkHealth() {
  try {
    const { data } = await mlClient.get('/health');
    return data;
  } catch (err) {
    return { status: 'unhealthy', error: err.message };
  }
}
