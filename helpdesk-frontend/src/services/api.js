import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // تأكدنا بلي هادا هو البورت د Laravel عندك
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// هاد الكود كيزيد الـ Token ديريكتومون من الـ localStorage ف كل طلب بلا دوخة
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // ركزي هنا: تأكدي من السبلينغ د Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// هادي فاش كيطرا إيرور 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // حيدنا الـ window.location.href من هنا باش ميبقاش يطيرك أوتوماتيكياً حتى نعرفو الإيرور
        if (error.response && error.response.status === 401) {
            console.log("Laravel rejected the token with 401!");
        }
        return Promise.reject(error);
    }
);

export default api;