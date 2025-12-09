
  
export  const apiGet = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
    });
    return response;
  };

export const apiPost = async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(data)
    });
    return response;
  };
export const apiPatch = async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(data)
    });
    return response;
  };

export const apiDelete = async (url: string) => {
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response;
  };

