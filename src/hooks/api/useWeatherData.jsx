import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;

export default function useDataWeather(lat, lon) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchData = useCallback(async (url) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(url, {
                timeout: 10000
            });
            setData(response.data);
            setRetryCount(0);
        } catch (error) {
            if (error.response?.status === 429 && retryCount < 3) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchData(url), 2000 * (retryCount + 1));
            } else {
                setError(error);
                console.error("Error fetching weather data:", error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        if (lat && lon && WEATHER_KEY) {
            fetchData(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}`);
        }
    }, [lat, lon, fetchData]);

    return { data, loading, error };

}
