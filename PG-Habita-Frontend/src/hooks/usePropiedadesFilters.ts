import { useState, useMemo } from 'react';
import { Propiedad } from '@/types/auth';

export const usePropiedadesFilters = () => {
    const [filters, setFilters] = useState({
        search: '',
        tipo: 'all',
        precioMax: 5000,
        habitaciones: 0,
        category: 'all',
    });

    const filterPropiedades = (propiedades: Propiedad[]) => {
        return propiedades.filter(prop => {
            const matchesSearch = !filters.search ||
                prop.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
                prop.direccion.toLowerCase().includes(filters.search.toLowerCase());

            const matchesTipo = filters.tipo === 'all' || prop.tipo === filters.tipo;
            const matchesPrecio = prop.precio_noche <= filters.precioMax;
            const matchesHabitaciones = !filters.habitaciones || prop.cant_hab >= filters.habitaciones;

            return matchesSearch && matchesTipo && matchesPrecio && matchesHabitaciones;
        });
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            tipo: 'all',
            precioMax: 5000,
            habitaciones: 0,
            category: 'all',
        });
    };

    return {
        filters,
        setFilters,
        filterPropiedades,
        resetFilters,
    };
};