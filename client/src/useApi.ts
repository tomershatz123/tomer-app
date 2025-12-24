import config from './config';
  
export  const apiGet = async (url: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.API_URL}${url}`, {
        method: 'GET',
        // credentials: 'include',
        headers: {
              'Authorization': `Bearer ${token}`
        }
    });
    return response;
  };

export const apiPost = async (url: string, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.API_URL}${url}`, {
      method: 'POST',
      // credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response;
  };

export const apiPatch = async (url: string, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.API_URL}${url}`, {
      method: 'PATCH',
      // credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response;
  };

export const apiDelete = async (url: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.API_URL}${url}`, {
      method: 'DELETE',
      // credentials: 'include',
      headers: {
            'Authorization': `Bearer ${token}`
      }
    });
    return response;
  };

