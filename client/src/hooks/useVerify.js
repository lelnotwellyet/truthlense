import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../config/api';

export function useVerifyText() {
  return useMutation({
    mutationFn: async ({ text, source_name }) => {
      const { data } = await api.post('/verify/text', { text, source_name });
      return data;
    },
  });
}

export function useVerifyUrl() {
  return useMutation({
    mutationFn: async ({ url }) => {
      const { data } = await api.post('/verify/url', { url });
      return data;
    },
  });
}

export function useVerifyImage() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/verify/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
}

export function useReports(isPublic = false) {
  return useQuery({
    queryKey: ['reports', isPublic],
    queryFn: async () => {
      const { data } = await api.get('/verify/reports', { params: { public: isPublic } });
      return data.reports;
    },
  });
}

export function useReport(id) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data } = await api.get(`/verify/reports/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
