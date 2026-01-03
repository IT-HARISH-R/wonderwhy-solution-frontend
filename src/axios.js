import axios from "axios";

const baseURL = 'http://56.228.33.77:3000'

const api = axios.create({
  baseURL: 'http://56.228.33.77:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});



export default api;