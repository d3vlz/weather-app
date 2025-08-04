import { useState, useEffect } from 'react';

export default function useGeolocation() {
    const [position, setPosition] = useState({ lat: null, lon: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError(new Error('Geolocation is not supported by your browser'));
            setLoading(false);
            return;
        }

        const successHandler = (position) => {
            setPosition({
                lat: position.coords.latitude.toFixed(2),
                lon: position.coords.longitude.toFixed(2)
            });
            setLoading(false);
        };

        const errorHandler = (error) => {
            setError(error);
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    }, []);

    return { position, loading, error };
}