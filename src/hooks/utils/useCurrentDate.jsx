import { useState } from 'react';

const useFechaActual = () => {
    const [currentDate] = useState(new Date());


    const opcionesFecha = { day: 'numeric' };
    const opcionesDiaSemana = { weekday: 'short' };
    const opcionesMes = { month: 'short' };

    const fecha = currentDate.toLocaleDateString('en-PE', opcionesFecha);
    const diaSemana = currentDate.toLocaleDateString('en-PE', opcionesDiaSemana);
    const mes = currentDate.toLocaleDateString('en-PE', opcionesMes);

    return { fecha, diaSemana, mes };
};

export default useFechaActual;