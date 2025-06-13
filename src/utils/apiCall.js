import axios from "axios";

const base_url = process.env.REACT_APP_API_BASE_URL;

export const apiCall = async (endpoint, method = "GET", data = null, config = {}) => {
    try {
        const response = await axios({
            url: `${base_url}${endpoint}`,
            method,
            data,
            withCredentials: true,
            ...config
        });

        if (response.pagination) {
            return { data: response.data, pagination: response.pagination };
        }

        return response.data;

    } catch (error) {
        console.log("shoing error:", error);
        throw error.response ? error.response.data : error;
    }

};