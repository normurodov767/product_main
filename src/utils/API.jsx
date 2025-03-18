import axios from "axios";
import { toast } from "sonner";

const API = axios.create({
    baseURL: "https://nt-shopping-list.onrender.com/api"
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers['x-auth-token'] =`${token}`;
    }
    return req;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            toast.error("Session expired. Please login again.");
            setTimeout(() => {
                window.location.replace("/login"); 
            }, 500);
        }
        return Promise.reject(err);
    }
);

export default API;