import { useQuery } from '@tanstack/react-query';
import api from '../config/api';

export function useNewsFeed(topic = 'all', page = 1, country = '') {
  return useQuery({
    queryKey: ['news', topic, page, country],
    queryFn: async () => {
      const params = { page, limit: 20 };
      if (topic && topic !== 'all') params.topic = topic;
      if (country) params.country = country;
      const { data } = await api.get('/news', { params });
      return data;
    },
  });
}

export function useArticle(id) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data } = await api.get(`/news/${id}`);
      return data.article;
    },
    enabled: !!id,
  });
}

export function useSearchNews(params) {
  return useQuery({
    queryKey: ['news-search', params],
    queryFn: async () => {
      const { data } = await api.get('/news/search', { params });
      return data;
    },
    enabled: !!params?.keyword || !!params?.topic,
  });
}

export function useTrendingNews() {
  return useQuery({
    queryKey: ['news-trending'],
    queryFn: async () => {
      const { data } = await api.get('/news/trending');
      return data.articles;
    },
  });
}
