import { useCallback } from 'react';

export const useApi = () => {
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const apiGet = useCallback(async (url: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  }, []);

  const apiPost = useCallback(async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  }, [getAuthHeaders]);

  const apiPatch = useCallback(async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  }, [getAuthHeaders]);

  const apiDelete = useCallback(async (url: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  }, []);

  return { apiGet, apiPost, apiPatch, apiDelete };
};