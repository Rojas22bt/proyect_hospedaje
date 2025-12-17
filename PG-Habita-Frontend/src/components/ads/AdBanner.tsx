import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PublicidadActiva } from '@/types/auth';
import api from '@/services/api';

const AdBanner: React.FC = () => {
    const [publicidades, setPublicidades] = useState<PublicidadActiva[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const cargarPublicidades = async () => {
            try {
                const data = await api.fetchPublicidadesActivas();
                setPublicidades(data);
            } catch (error) {
                console.error('Error cargando publicidades:', error);
            }
        };

        cargarPublicidades();
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % publicidades.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + publicidades.length) % publicidades.length);
    };

    const closeBanner = () => {
        setIsVisible(false);
    };

    if (!isVisible || publicidades.length === 0) {
        return null;
    }

    const currentAd = publicidades[currentIndex];

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'promocion':
                return 'bg-gradient-to-r from-amber-500 to-orange-500';
            case 'anuncio':
                return 'bg-gradient-to-r from-blue-500 to-cyan-500';
            case 'funcionalidad':
                return 'bg-gradient-to-r from-purple-500 to-pink-500';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600';
        }
    };

    return (
        <Card className="relative bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-l-habita-primary shadow-lg mb-6">
            <CardContent className="p-4">
                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeBanner}
                    className="absolute top-2 right-2 h-6 w-6"
                >
                    <X className="h-4 w-4" />
                </Button>

                {/* Navigation Arrows */}
                {publicidades.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </>
                )}

                {/* Content */}
                <div className="flex items-center gap-4 pr-8">
                    {currentAd.imagen_url && (
                        <div className="flex-shrink-0">
                            <img
                                src={currentAd.imagen_url}
                                alt={currentAd.titulo}
                                className="w-16 h-16 object-cover rounded-lg shadow-md"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                                {currentAd.titulo}
                            </h3>
                            <Badge className={getTipoColor(currentAd.tipo)}>
                                {currentAd.tipo_display || currentAd.tipo}
                            </Badge>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                            {currentAd.descripcion}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Válido hasta: {new Date(currentAd.fecha_fin).toLocaleDateString()}</span>
                            {publicidades.length > 1 && (
                                <span>
                                    {currentIndex + 1} de {publicidades.length}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdBanner;