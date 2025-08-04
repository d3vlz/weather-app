import useDataWeather from "../hooks/api/useWeatherData";
import useDataWeatherFive from "../hooks/api/useWeatherForecast";
import LeftPanel from './layout/LeftPanel';
import RightPanel from './layout/RightPanel';
import { useEffect, useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';

export default function WeatherApp() {
    const { position, loading: geoLoading } = useGeolocation();
    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const { data, loading, error } = useDataWeather(lat || "19.36", lon || "-99.35")
    const [isMetric, setIsMetric] = useState(true);
    const apiUnits = isMetric ? 'metric' : 'imperial';
    const { datas, loading: loadingFive, error: errorFive } = useDataWeatherFive(lat || "19.36", lon || "-99.35", apiUnits);

    const [kelvinTemperature, setKelvinTemperature] = useState(null);
    const [originalWindSpeed, setOriginalWindSpeed] = useState(null);
    const [originalVisibility, setOriginalVisibility] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (position.lat && position.lon && !lat && !lon) {
            setLat(position.lat);
            setLon(position.lon);
        }
    }, [position, lat, lon]);

    useEffect(() => {
        if (data && data.main && data.main.temp !== undefined) {
            setKelvinTemperature(data.main.temp);
        }
        if (data && data.wind && data.wind.speed !== undefined) {
            setOriginalWindSpeed(data.wind.speed);
        }
        if (data && data.visibility !== undefined) {
            setOriginalVisibility(data.visibility);
        }
    }, [data]); 

    useEffect(() => {
        if (data && data.sys) {
            const currentTime = Date.now() / 1000;
            const sunrise = data.sys.sunrise;
            const sunset = data.sys.sunset;
            const isNight = currentTime < sunrise || currentTime > sunset;
            if (!localStorage.getItem('theme-manually-set')) {
                setIsDarkMode(isNight);
                if (isNight) {
                    document.body.classList.add('dark');
                } else {
                    document.body.classList.remove('dark');
                }
            } else {
                const savedTheme = localStorage.getItem('theme');
                setIsDarkMode(savedTheme === 'dark');
                if (savedTheme === 'dark') {
                    document.body.classList.add('dark');
                } else {
                    document.body.classList.remove('dark');
                }
            }
        }
    }, [data]);

    const celsiusTemperature = kelvinTemperature !== null ? (kelvinTemperature - 273.15).toFixed(1) : null;
    const fahrenheitTemperature = kelvinTemperature !== null ? ((kelvinTemperature - 273.15) * 9 / 5 + 32).toFixed(1) : null;

    const windSpeedMs = originalWindSpeed !== null ? originalWindSpeed.toFixed(2) : null;
    const windSpeedMph = originalWindSpeed !== null ? (originalWindSpeed * 2.23694).toFixed(2) : null;

    const visibilityKm = originalVisibility !== null ? (originalVisibility / 1000).toFixed(2) : null;
    const visibilityMiles = originalVisibility !== null ? (originalVisibility * 0.000621371).toFixed(2) : null;


    if (loading || loadingFive || (geoLoading && !lat && !lon)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-700">Cargando datos del clima...</p>
            </div>
        );
    }
    if (error || errorFive) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 border border-red-400 text-red-700 p-4">
                <p className="text-lg">Error al cargar los datos del clima: {error?.message || errorFive?.message}</p>
            </div>
        );
    }
    if (!data || !datas || !datas.list || datas.list.length < 39 || !data.weather || !data.weather[0]) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-700">Cargando datos del clima...</p>
            </div>
        );
    }


    let icons = [datas.list[6].weather[0].main, datas.list[14].weather[0].main, datas.list[22].weather[0].main, datas.list[30].weather[0].main, datas.list[38].weather[0].main]
    let dia1 = []
    let dia2 = []
    let dia3 = []
    let dia4 = []
    let dia5 = []
    const days = [dia1, dia2, dia3, dia4, dia5];
    const ranges = [[0, 7], [8, 15], [16, 23], [24, 31], [32, 39]];
    
    ranges.forEach(([start, end], dayIndex) => {
        for (let i = start; i <= end; i++) {
            if (datas?.list[i]?.main?.temp) {
                days[dayIndex].push(datas.list[i].main.temp.toFixed(1));
            }
        }
    });
    days.forEach(day => day.sort((a, b) => a - b));

    const minMax = {
        tempDia1: [dia1[0], dia1[7]],
        tempDia2: [dia2[0], dia2[7]],
        tempDia3: [dia3[0], dia3[7]],
        tempDia4: [dia4[0], dia4[7]],
        tempDia5: [dia5[0], dia5[7]],
    }



    const displayTemperature = isMetric ? celsiusTemperature : fahrenheitTemperature;
    const displayTempUnit = isMetric ? 'C' : 'F';
    const displayWindSpeed = isMetric ? windSpeedMs : windSpeedMph;
    const displayWindSpeedUnit = isMetric ? 'ms' : 'mph';
    const displayVisibility = isMetric ? visibilityKm : visibilityMiles;
    const displayVisibilityUnit = isMetric ? 'km' : 'miles';

    const toggleMetricUnit = (unitType) => {
        setIsMetric(unitType === 'metric');
    };

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        
        if (newDarkMode) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        localStorage.setItem('theme-manually-set', 'true');
    }


    return (
        <>
        <div className="flex flex-col md:flex-row w-full bg-[#bee2fa] dark:bg-[#100E1D]">

            <div className="w-full  md:w-1/3 bg-[#729dfa] dark:bg-[#1E213A]  p-6 flex flex-col items-center justify-between relative">
                <LeftPanel
                    temperature={displayTemperature}
                    unit={displayTempUnit}
                    weather={data.weather[0]?.description}
                    ubication={data.name}
                    setLat={setLat}
                    setLon={setLon}
                    icono={data.weather[0].main}
                />
            </div>
            <div className="flex flex-col md:w-2/3">
                <div className="flex items-center justify-end mt-6 mr-10 gap-2">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => toggleMetricUnit('metric')} className="bg-gray-200 dark:bg-[#ffffff] text-blue-950 w-10 h-10 rounded-full font-bold text-lg flex items-center justify-center hover:bg-[#8F909A] transition-colors duration-200">
                            °C
                        </button>
                        <button onClick={() => toggleMetricUnit('imperial')} className="bg-[#2e2e8b] dark:bg-[#585676] text-white w-10 h-10 rounded-full font-bold text-lg flex items-center justify-center hover:bg-[#8F909A] transition-colors duration-200">
                            °F
                        </button>
                    </div>

                </div>
                <div className="w-full bg-[#bee2fa] dark:bg-[#100E1D] relative">
                    <RightPanel
                        windSpeed={displayWindSpeed}
                        windSpeedUnit={displayWindSpeedUnit}
                        humidity={data.main?.humidity}
                        visibility={displayVisibility}
                        visibilityUnit={displayVisibilityUnit}
                        degrees={data.wind?.deg}
                        pressure={data.main?.pressure}
                        minMax={minMax}
                        unit={displayTempUnit}
                        icons={icons}
                    />
                </div>
            </div>

        </div>
        <button
            onClick={toggleDarkMode}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="Toggle dark mode"
        >
            <div className="relative w-6 h-6">
                <svg
                    className={`absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
                <svg
                    className={`absolute inset-0 w-6 h-6 text-blue-400 transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-0'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            </div>
        </button>
        </>
    );
}

