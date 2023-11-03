import axios from 'axios';
export class BroadcastClient {
  async broadcastTo(method: string, url: string, data?: any) {
    console.log('S--->', method, url, data);
    try {
      switch (method) {
        case 'GET':
          return await axios.get(url);
        case 'POST':
          return await axios.post(url, data);
        case 'PUT':
          return await axios.put(url, data);
        case 'DELETE':
          return await axios.delete(url);
      }
    } catch (e) {
      console.log('Client did not answer !', method, url, data, e);
    }
  }
}
