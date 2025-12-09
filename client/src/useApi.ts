import { useCallback } from 'react';

export const useApi = () => {
  
  const apiGet = useCallback(async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response;
  }, []);

  const apiPost = useCallback(async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(data)
    });
    return response;
  }, []);

  const apiPatch = useCallback(async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(data)
    });
    return response;
  }, []);

  const apiDelete = useCallback(async (url: string) => {
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response;
  }, []);

  return { apiGet, apiPost, apiPatch, apiDelete };
};