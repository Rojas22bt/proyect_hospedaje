// src/components/favoritos/FavoritosButton.tsx
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface FavoritosButtonProps {
  propiedadId: number;
  size?: 'sm' | 'md' | 'lg';
  initialEsFavorito?: boolean;
}

const FavoritosButton: React.FC<FavoritosButtonProps> = ({
  propiedadId,
  size = 'md',
  initialEsFavorito = false
}) => {
  const [esFavorito, setEsFavorito] = useState(initialEsFavorito);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Verificar si la propiedad ya es favorito al cargar
  useEffect(() => {
    const verificarFavorito = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await api.listarFavoritos();
        const favoritos = Array.isArray(response) ? response : [];
        const esFav = favoritos.some((fav: any) => fav.propiedad === propiedadId || fav.propiedad_info?.id === propiedadId);
        setEsFavorito(esFav);
      } catch (error) {
        console.error('Error verificando favorito:', error);
      }
    };

    verificarFavorito();
  }, [propiedadId, isAuthenticated]);

  const toggleFavorito = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar a favoritos",
        variant: "destructive",
      });
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const response = await api.toggleFavorito(propiedadId);

      if (response.accion) {
        setEsFavorito(response.es_favorito);
        toast({
          title: response.es_favorito ? "❤️ Agregado a favoritos" : "💔 Eliminado de favoritos",
          description: response.es_favorito
            ? "La propiedad se agregó a tus favoritos"
            : "La propiedad se eliminó de tus favoritos",
        });
      }
    } catch (error: any) {
      console.error('Error al toggle favorito:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo actualizar favoritos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`
        ${sizeClasses[size]}
        rounded-full
        backdrop-blur-sm
        border-2
        transition-all
        duration-300
        hover:scale-110
        ${esFavorito
          ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
          : 'bg-white/80 border-white/50 text-gray-600 hover:bg-white hover:border-white'
        }
      `}
      onClick={toggleFavorito}
      disabled={loading}
    >
      <Heart
        className={`
          transition-all duration-300
          ${esFavorito ? 'fill-current' : ''}
          ${loading ? 'animate-pulse' : ''}
        `}
        size={iconSizes[size]}
      />
    </Button>
  );
};

export default FavoritosButton;