import { useEffect, useState } from "react";
import useCitiesData from "../../hooks/api/useCitiesData";
import useFechaActual from "../../hooks/utils/useCurrentDate";
import useGeoLoc from "../../hooks/useIPLocation";
import useGeolocation from "../../hooks/useGeolocation";
export default function LeftPanel({ temperature, weather, ubication, setLat, setLon, unit, icono }) {
    const [location, setLocation] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const { cities, loading, error } = useCitiesData('/data/cities.json');
    const [panel, setPanel] = useState(true)
    const [icon, setIcon] = useState("/icons/weather/02d.png")
    const { loc, loading: loadingLoc, error: errorLoc } = useGeoLoc()
    const { position: geoPosition } = useGeolocation();
    const { fecha, diaSemana, mes } = useFechaActual()

    useEffect(() => {
        if (icono === "Rain") {
            setIcon("/icons/weather/10d.png")
        } else if (icono === "Thunderstorm") {
            setIcon("/icons/weather/11d.png")
        } else if (icono === "Drizzle") {
            setIcon("/icons/weather/09d.png")
        } else if (icono === "Snow") {
            setIcon("/icons/weather/13d.png")
        } else if (icono === "Atmosphere") {
            setIcon("/icons/weather/50d.png")
        } else if (icono === "Clear") {
            setIcon("/icons/weather/01d.png")
        } else if (icono === "Clouds") {
            setIcon("/icons/weather/02d.png")
        }
    }, [icono])
    if (loading || loadingLoc) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-700">Cargando ciudades...</p>
            </div>
        );
    }

    if (error || errorLoc) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 border border-red-400 text-red-700 p-4">
                <p className="text-lg">Error al cargar las ciudades: {error?.message || errorLoc?.message}</p>
            </div>
        );
    }


    function toogleGeoLoc() {
        if (geoPosition.lat && geoPosition.lon) {
            setLat(geoPosition.lat);
            setLon(geoPosition.lon);
            setLocation('');
            setSuggestions([]);
            if (!panel) tooglePanel();
        } else if (loc.city) {
            const cityToSearch = loc.city.trim();
            const filtrado = cities.filter((city) => city.name.toLowerCase() === cityToSearch.toLowerCase());
            if (filtrado.length > 0) {
                setLat(filtrado[0].lat);
                setLon(filtrado[0].lon);
                setLocation('');
                setSuggestions([]);
                if (!panel) tooglePanel();
            } else {
                alert("Ciudad no encontrada. Por favor, intenta de nuevo.");
            }
        } else {
            alert("No se pudo obtener la ubicación actual. Por favor, habilita la geolocalización en tu navegador.");
        }
    }

    function tooglePanel() {
        setPanel((state) => !state);
        if (!panel) {
            setSuggestions([]);
            setLocation('');
        }
    }
    function handleSubmit(e) {
        e.preventDefault();
        const cityToSearch = location.trim();
        if (!cityToSearch) return
        const filtrado = cities.filter((city) => city.name.toLowerCase() === cityToSearch.toLowerCase());
        if (filtrado.length > 0) {
            setLat(filtrado[0].lat);
            setLon(filtrado[0].lon);
            setLocation('');
            setSuggestions([]);
            tooglePanel();
        } else {
            alert("Ciudad no encontrada. Por favor, intenta de nuevo.");
        }
    }
    const handleLocation = (e) => {
        e.preventDefault()
        const newValue = e.target.value
        setLocation(newValue);
        if (newValue.length > 0) {
            const filteredSuggestions = cities
                .filter((city) =>
                    city.name.toLowerCase().startsWith(newValue.toLowerCase())
                )
                .slice(0, 7);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }

    const handleSuggestionClick = (cityName, lat, lon) => {
        setLocation(cityName);
        setLat(lat);
        setLon(lon);
        setSuggestions([]);
        tooglePanel();
    };

    return (
        <>
            <div name="panel2" className={`${panel ? "hidden" : "flex"} flex-col justify-center items-end w-[100%] gap-3`} >
                <button onClick={tooglePanel} className="w-[20px] text-black dark:text-white text-2xl">X</button>
                <div className="flex w-[100%] items-center justify-around relative">
                    <form onSubmit={handleSubmit} className="border-1 border-black dark:border-white flex" >
                        <img src="/icons/ui/search.svg" alt="search" className="w-[25px] mx-2" />
                        <input onChange={handleLocation} value={location} name="inputlocation" type="text" placeholder="search location" className="text-white p-1" />
                    </form>
                    <button onClick={handleSubmit} className="text-white font-semibold text-lg bg-[#3c47e9] px-3 py-1 rounded-sm">Search</button>

                    {suggestions.length > 0 && (
                        <ul className="absolute top-full left-0 mt-2 w-[80%] bg-[#2e2e8b] dark:bg-gray-700 text-white rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                            {suggestions.map((city) => (
                                <li
                                    key={city.id}
                                    onClick={() => handleSuggestionClick(city.name, city.lat, city.lon)}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                                >
                                    {city.name}, {city.country}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div name="panel1" className={`w-[100%] relative ${panel ? "flex" : "hidden"} flex-col items-center`}>

                <div className="w-[120%]  absolute z-0 opacity-10 top-25">
                    <img src="/icons/weather/Cloud-background.png" alt="cloud" />
                </div>

                <div className="w-full flex justify-around items-center mb-16 ">
                    <button onClick={tooglePanel} className="bg-[#2e2e8b] dark:bg-[#6E707A] hover:bg-[#8F909A] text-white px-4 py-3 rounded shadow-md text-sm font-semibold transition-colors duration-200">
                        Search for Places
                    </button>
                    <button onClick={toogleGeoLoc} className="bg-[#2e2e8b] dark:bg-[#6E707A] hover:bg-[#8F909A] text-white p-2 rounded-full shadow-md transition-colors duration-200">
                        <img src="/icons/ui/location.svg" alt="location" className="w-[30px]" />
                    </button>
                </div>

                <div className="mb-16">
                    <div className="w-48 h-48 rounded-full flex items-center justify-center">
                        <img src={icon} alt="weather" className="" />
                    </div>
                </div>

                <div className="text-[#2e2e8b] dark:text-white text-[100px] font-semibold mb-6">
                    {temperature}<span className="text-[50px] text-[#525281] dark:text-gray-400 ">°{unit}</span>
                </div>

                <div className="text-[#2e2e8b] dark:text-[#A09FB1] text-2xl mb-8 font-semibold">
                    {weather}
                </div>

                <div className="w-full text-center text-[#2e2e8b] dark:text-[#88869D] text-sm flex flex-col items-center mb-10 gap-5">
                    <p className="mb-2">Today • {diaSemana}, {fecha} {mes}</p>
                    <div className="flex items-center">

                        <img src="/icons/ui/location_on.svg" alt="locationLogo" className="w-[20px]" />
                        <span>{ubication}</span>
                    </div>
                </div>
            </div>

        </>
    );
}