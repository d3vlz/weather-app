import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;

export default function useDataWeatherFive(lat, lon, units) {
    const [datas, setDatas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchData = useCallback(async (currentLat, currentLon, currentUnits) => {
        setLoading(true);
        setError(null);
        try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLat}&lon=${currentLon}&appid=${WEATHER_KEY}&units=${currentUnits}`;
            const response = await axios.get(url, {
                timeout: 10000
            });
            setDatas(response.data);
            setRetryCount(0);
        } catch (err) {
            if (err.response?.status === 429 && retryCount < 3) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchData(currentLat, currentLon, currentUnits), 2000 * (retryCount + 1));
            } else {
                setError(err);
                console.error("Error fetching 5-day weather data:", err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        if (lat && lon && units && WEATHER_KEY) {
            fetchData(lat, lon, units);
        }
    }, [lat, lon, units, fetchData]);

    return { datas, loading, error };
}
