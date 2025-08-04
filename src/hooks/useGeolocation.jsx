import { useState, useEffect } from 'react';

export default function useGeolocation() {
    const [position, setPosition] = useState({ lat: null, lon: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const LIMA_FALLBACK = {
        lat: '-12.05',
        lon: '-77.04'
    };

    const GEOLOCATION_TIMEOUT = 8000;

    useEffect(() => {
        let timeoutId;
        let hasResponded = false;

        const setFallbackLocation = (reason) => {
            if (!hasResponded) {
                hasResponded = true;
                console.warn(`Geolocation failed: ${reason}. Using fallback location (Lima, Peru)`);
                setPosition(LIMA_FALLBACK);
                setError(new Error(`${reason}. Using fallback location.`));
                setLoading(false);
            }
        };

        if (!navigator.geolocation) {
            setFallbackLocation('Geolocation is not supported by your browser');
            return;
        }

        timeoutId = setTimeout(() => {
            setFallbackLocation('Geolocation timeout');
        }, GEOLOCATION_TIMEOUT);

        const successHandler = (position) => {
            if (!hasResponded) {
                hasResponded = true;
                clearTimeout(timeoutId);
                setPosition({
                    lat: position.coords.latitude.toFixed(2),
                    lon: position.coords.longitude.toFixed(2)
                });
                setLoading(false);
                setError(null);
            }
        };

        const errorHandler = (error) => {
            clearTimeout(timeoutId);
            let errorMessage = 'Unknown error';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'User denied geolocation permission';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Geolocation request timeout';
                    break;
            }
            
            setFallbackLocation(errorMessage);
        };

        navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
            enableHighAccuracy: false,
            timeout: GEOLOCATION_TIMEOUT - 1000,
            maximumAge: 300000
        });

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return { position, loading, error };
}