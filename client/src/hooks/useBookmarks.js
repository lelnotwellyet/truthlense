import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const { data } = await api.get('/bookmarks');
      return data.bookmarks;
    },
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, article_id, report_id }) => {
      const { data } = await api.post('/bookmarks', { type, article_id, report_id });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/bookmarks/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
}
