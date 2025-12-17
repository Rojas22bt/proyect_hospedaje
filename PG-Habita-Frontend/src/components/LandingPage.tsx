import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, Heart, Filter, Bed, Bath, Home, Building, Waves, Mountain, Building2, Sparkles, X, Calendar, Menu, User, Crown, ChevronRight, Zap, Shield, Award, Globe, Coffee, Wifi, Car, Leaf, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { designClasses, animations } from '@/lib/design-system';
import { usePropiedadesReservas } from '@/hooks/usePropiedadesReservas';
import { useReservaModal } from '@/hooks/useReservaModal';
import GoogleMapsProperties from '@/components/maps/GoogleMapsProperties';
import PropertyCard from '@/components/propiedades/PropertyCard';
import FavoritosButton from '@/components/favoritos/FavoritosButton';

interface Propiedad {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  tipo: string;
  caracteristicas: string[];
  status: boolean;
  precio_noche: number;
  cant_bath: number;
  cant_hab: number;
  rating: number;
  reviews: number;
  imagen?: string;
  categoria?: string;
  imagenes?: string[];
  user?: number;
  max_huespedes?: number;
  pets?: boolean;
  estado_baja?: string;
  latitud?: number | null;
  longitud?: number | null;
  direccion_completa?: string;
  ciudad?: string;
  provincia?: string;
  departamento?: string;
  pais?: string;
  es_destino_turistico?: boolean;
  esta_disponible: boolean;
}

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { onOpen } = useReservaModal();

  // 🔥 USAR EL HOOK MEJORADO PARA PROPIEDADES
  const { propiedades, isLoading, error } = usePropiedadesReservas();

  const [filters, setFilters] = useState({
    search: '',
    tipo: 'all',
    precioMax: 10000,
    categoria: 'all'
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Categorías mejoradas con colores de marca
  const categories = [
    {
      id: 'all',
      label: 'Todos',
      icon: Home,
      color: 'bg-gradient-to-r from-habita-primary to-red-600',
      bgColor: 'from-habita-primary/20 to-red-600/20'
    },
    {
      id: 'beach',
      label: 'Playa',
      icon: Waves,
      color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      bgColor: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      id: 'mountain',
      label: 'Montaña',
      icon: Mountain,
      color: 'bg-gradient-to-r from-emerald-500 to-green-600',
      bgColor: 'from-emerald-500/20 to-green-600/20'
    },
    {
      id: 'city',
      label: 'Ciudad',
      icon: Building2,
      color: 'bg-gradient-to-r from-habita-secondary to-gray-800',
      bgColor: 'from-habita-secondary/20 to-gray-800/20'
    },
    {
      id: 'luxury',
      label: 'Lujo',
      icon: Crown,
      color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      bgColor: 'from-yellow-500/20 to-amber-500/20'
    },
    {
      id: 'nature',
      label: 'Naturaleza',
      icon: Leaf,
      color: 'bg-gradient-to-r from-lime-500 to-green-500',
      bgColor: 'from-lime-500/20 to-green-500/20'
    },
  ];

  // Servicios destacados
  const features = [
    {
      icon: Shield,
      title: "Reservas Seguras",
      description: "Pagos protegidos y verificación de propiedades"
    },
    {
      icon: Zap,
      title: "Confirmación Inmediata",
      description: "Reserva instantánea con confirmación al momento"
    },
    {
      icon: Globe,
      title: "Experiencias Únicas",
      description: "Propiedades seleccionadas para momentos especiales"
    },
    {
      icon: Award,
      title: "Calidad Verificada",
      description: "Todas las propiedades pasan nuestro proceso de verificación"
    }
  ];

  // 🔥 FILTRAR SOLO PROPIEDADES ACTIVAS Y DISPONIBLES
  const propiedadesDisponibles = propiedades.filter(prop =>
    prop.esta_disponible && prop.status && prop.estado_baja === 'activa'
  );

  const filteredPropiedades = propiedadesDisponibles.filter(prop => {
    const matchesSearch = !filters.search ||
      prop.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
      (prop.direccion_completa && prop.direccion_completa.toLowerCase().includes(filters.search.toLowerCase())) ||
      prop.descripcion.toLowerCase().includes(filters.search.toLowerCase());

    const matchesTipo = filters.tipo === 'all' || prop.tipo === filters.tipo;
    const matchesPrecio = prop.precio_noche <= filters.precioMax;
    const matchesCategory = activeCategory === 'all' || prop.categoria === activeCategory;

    return matchesSearch && matchesTipo && matchesPrecio && matchesCategory;
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tipo: 'all',
      precioMax: 10000,
      categoria: 'all'
    });
    setActiveCategory('all');
  };

  const hasActiveFilters = filters.search || filters.tipo !== 'all' || filters.precioMax < 10000 || activeCategory !== 'all';

  const handleViewProperty = (propiedad: Propiedad) => {
    setSelectedProperty(propiedad);
    // Aquí podrías abrir un modal o redirigir a una página de detalles
    console.log('Ver propiedad:', propiedad);
  };

  const handleReservar = (propiedad: Propiedad) => {
    onOpen(propiedad);
  };

  // 🔥 HEADER MEJORADO
  const AnimatedHeader = () => (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-500 backdrop-blur-md border-b",
      isScrolled
        ? "bg-white/95 shadow-xl border-gray-200/50"
        : "bg-transparent border-transparent"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12",
              isScrolled
                ? "bg-gradient-to-br from-habita-primary to-red-600 shadow-lg"
                : "bg-white/20 backdrop-blur-sm border border-white/30"
            )}>
              <Home className={cn(
                "w-6 h-6 transition-colors duration-500",
                isScrolled ? "text-white" : "text-white"
              )} />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "text-2xl font-bold transition-colors duration-500",
                isScrolled ? "text-habita-secondary" : "text-white"
              )}>
                Habita
              </span>
              <span className={cn(
                "text-xs transition-colors duration-500 -mt-1",
                isScrolled ? "text-gray-500" : "text-white/80"
              )}>
                Tu hogar, en cualquier lugar
              </span>
            </div>
          </div>

          {/* Navegación para desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#propiedades-section" className={cn(
              "font-medium transition-all duration-300 hover:scale-105",
              isScrolled ? "text-habita-secondary hover:text-habita-primary" : "text-white hover:text-yellow-200"
            )}>
              Propiedades
            </a>
            <a href="#categorias" className={cn(
              "font-medium transition-all duration-300 hover:scale-105",
              isScrolled ? "text-habita-secondary hover:text-habita-primary" : "text-white hover:text-yellow-200"
            )}>
              Categorías
            </a>
            <a href="#mapa-section" className={cn(
              "font-medium transition-all duration-300 hover:scale-105",
              isScrolled ? "text-habita-secondary hover:text-habita-primary" : "text-white hover:text-yellow-200"
            )}>
              Mapa
            </a>
            <a 
              href="/calendario"
              className={cn(
                "font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2",
                isScrolled ? "text-habita-secondary hover:text-habita-primary" : "text-white hover:text-yellow-200"
              )}
            >
              <Calendar className="w-4 h-4" />
              Calendario
            </a>
            <a href="#como-funciona" className={cn(
              "font-medium transition-all duration-300 hover:scale-105",
              isScrolled ? "text-habita-secondary hover:text-habita-primary" : "text-white hover:text-yellow-200"
            )}>
              Cómo funciona
            </a>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  className={cn(
                    "transition-all duration-500 hover:scale-105 font-semibold shadow-lg",
                    isScrolled
                      ? "bg-habita-primary hover:bg-red-600 text-white"
                      : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30"
                  )}
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Avatar className={cn(
                  "h-10 w-10 border-2 transition-all duration-500 hover:scale-110 cursor-pointer shadow-lg",
                  isScrolled ? "border-habita-primary/50" : "border-white/50"
                )}>
                  <AvatarFallback className={cn(
                    "transition-colors duration-500 font-semibold",
                    isScrolled ? "bg-habita-primary text-white" : "bg-white/20 text-white"
                  )}>
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant={isScrolled ? "outline" : "outline"}
                  className={cn(
                    "transition-all duration-500 hover:scale-105 font-semibold border-2",
                    isScrolled
                      ? "text-habita-secondary border-habita-secondary hover:bg-habita-secondary hover:text-white"
                      : "text-white border-white/50 hover:bg-white/20"
                  )}
                  onClick={() => window.location.href = '/login'}
                >
                  Iniciar sesión
                </Button>
                <Button
                  className={cn(
                    "transition-all duration-500 hover:scale-105 shadow-xl font-semibold",
                    isScrolled
                      ? "bg-habita-primary hover:bg-red-600 text-white"
                      : "bg-white text-gray-900 hover:bg-white/95 shadow-2xl"
                  )}
                  onClick={() => window.location.href = '/register'}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // 🔥 ESTADO DE CARGA
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
        <AnimatedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-r from-habita-primary to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Explorando propiedades únicas</h2>
            <p className="text-gray-600">Buscando las mejores experiencias para ti</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-gradient-to-r from-gray-200 to-gray-300 animate-shimmer"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-1/2"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-2/3"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <AnimatedHeader />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-habita-secondary via-habita-primary to-red-600"
      >
        {/* Elementos de fondo animados */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/8 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute bottom-40 right-10 w-12 h-12 bg-white/3 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center animate-fade-in">
            {/* Badge de bienvenida */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30 animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white font-semibold text-sm">
                {propiedadesDisponibles.length}+ propiedades activas descubiertas
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight">
              Vive experiencias{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-gradient-shift">
                inolvidables
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Descubre propiedades exclusivas alrededor del mundo. Desde cabañas en la montaña hasta lofts en la ciudad, tu próxima aventura te espera.
            </p>

            {/* Barra de búsqueda mejorada */}
            <Card className="bg-white/15 backdrop-blur-md border-white/30 p-2 shadow-2xl animate-scale-in">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row gap-4 p-6">
                  <div className="flex-1">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        ¿Qué estás buscando?
                      </label>
                      <div className="relative">
                        <Input
                          placeholder="Destino, propiedad o experiencia..."
                          className="pl-12 bg-white/95 border-white/30 h-14 text-lg placeholder-gray-500 focus:bg-white transition-all duration-300"
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Building2 className="w-4 w-4" />
                        Tipo de propiedad
                      </label>
                      <Select value={filters.tipo} onValueChange={(value) => setFilters({...filters, tipo: value})}>
                        <SelectTrigger className="bg-white/95 border-white/30 h-14 text-lg focus:bg-white transition-all duration-300">
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">🏠 Todos los tipos</SelectItem>
                          <SelectItem value="Casa">🏡 Casas</SelectItem>
                          <SelectItem value="Departamento">🏢 Departamentos</SelectItem>
                          <SelectItem value="Cabaña">🌲 Cabañas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 h-14 px-8 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => document.getElementById('propiedades-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Explorar Ahora
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-2xl mx-auto">
              {[
                { number: propiedadesDisponibles.length, label: 'Propiedades Activas' },
                { number: '50+', label: 'Ciudades' },
                { number: '4.8', label: 'Rating Promedio' },
                { number: '10K+', label: 'Huéspedes' }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Sección de Características */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Por qué elegir <span className="text-habita-primary">Habita</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una experiencia de reserva sin igual con propiedades verificadas y servicios premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-white to-gray-50 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-habita-primary to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Categorías */}
      <section id="categorias" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explora por <span className="text-habita-primary">categorías</span>
            </h2>
            <p className="text-xl text-gray-600">Encuentra el tipo de experiencia que buscas</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex flex-col items-center gap-4 p-6 rounded-3xl transition-all duration-500 border-2 group relative overflow-hidden",
                    activeCategory === category.id
                      ? `border-habita-primary bg-gradient-to-br ${category.bgColor} scale-105 shadow-xl`
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Efecto de fondo animado */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    activeCategory === category.id && "opacity-100"
                  )}>
                    <div className={cn(
                      "w-full h-full bg-gradient-to-br opacity-10",
                      category.color.replace('bg-gradient-to-r', '')
                    )}></div>
                  </div>

                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:scale-110 relative z-10",
                    activeCategory === category.id ? category.color : "bg-gray-400"
                  )}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <span className={cn(
                    "text-lg font-semibold transition-colors duration-300 relative z-10",
                    activeCategory === category.id ? "text-habita-primary" : "text-gray-700"
                  )}>
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección de Propiedades */}
      <section id="propiedades-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12 animate-fade-in">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Propiedades <span className="text-habita-primary">destacadas</span>
              </h2>
              <p className="text-xl text-gray-600 mt-2">
                {filteredPropiedades.length} de {propiedadesDisponibles.length} propiedades disponibles
              </p>
            </div>

            <Select>
              <SelectTrigger className="w-48 h-12 border-2 border-gray-200">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">💰 Precio: menor a mayor</SelectItem>
                <SelectItem value="price-desc">💰 Precio: mayor a menor</SelectItem>
                <SelectItem value="rating">⭐ Mejor calificados</SelectItem>
                <SelectItem value="popular">🔥 Más populares</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid de propiedades */}
          {filteredPropiedades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredPropiedades.map((propiedad, index) => (
                <Card key={propiedad.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in overflow-hidden border-2 border-gray-100">
                  <CardContent className="p-0 relative">
                    {/* Imagen de la propiedad */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                      {propiedad.imagen ? (
                        <img
                          src={propiedad.imagen}
                          alt={propiedad.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-habita-primary/20 to-red-600/20">
                          <Home className="h-16 w-16 text-habita-primary/50" />
                        </div>
                      )}

                      {/* Badge de tipo */}
                      <div className="absolute top-3 left-3">
                        <Badge className={cn(
                          "backdrop-blur-sm border-0 font-semibold",
                          propiedad.tipo === 'Casa' ? "bg-green-500/90 text-white" :
                          propiedad.tipo === 'Departamento' ? "bg-blue-500/90 text-white" :
                          "bg-amber-500/90 text-white"
                        )}>
                          {propiedad.tipo}
                        </Badge>
                      </div>

                      {/* Botón de favoritos */}
                      <div className="absolute top-3 right-3">
                        <FavoritosButton
                          propiedadId={propiedad.id}
                          size="sm"
                        />
                      </div>

                      {/* Precio */}
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="text-white font-bold text-lg">
                            {formatCurrency(propiedad.precio_noche)}
                            <span className="text-white/70 text-sm font-normal">/noche</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de la propiedad */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1">
                          {propiedad.nombre}
                        </h3>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                        {propiedad.descripcion}
                      </p>

                      {/* Ubicación */}
                      <div className="flex items-center gap-1 text-gray-500 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {propiedad.ciudad || 'Santa Cruz'}, {propiedad.departamento || 'Bolivia'}
                        </span>
                      </div>

                      {/* Características */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{propiedad.cant_hab} hab.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{propiedad.cant_bath} baños</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{propiedad.max_huespedes} huesp.</span>
                        </div>
                        {propiedad.pets && (
                          <div className="flex items-center gap-1">
                            <span>🐾</span>
                          </div>
                        )}
                      </div>

                      {/* Características destacadas */}
                      {propiedad.caracteristicas && propiedad.caracteristicas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {propiedad.caracteristicas.slice(0, 3).map((caracteristica, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                              {caracteristica}
                            </Badge>
                          ))}
                          {propiedad.caracteristicas.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50">
                              +{propiedad.caracteristicas.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-habita-primary hover:bg-red-600 text-white"
                          onClick={() => handleReservar(propiedad)}
                        >
                          Reservar
                        </Button>
                        <Button
                          variant="outline"
                          className="border-habita-primary text-habita-primary hover:bg-habita-primary hover:text-white"
                          onClick={() => handleViewProperty(propiedad)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 animate-fade-in">
              <CardContent className="p-16">
                <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  No se encontraron propiedades
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  {propiedadesDisponibles.length === 0
                    ? 'Estamos trabajando en agregar más propiedades increíbles. ¡Vuelve pronto!'
                    : 'Intenta ajustar tus filtros para encontrar más opciones.'
                  }
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-habita-primary to-red-600 hover:from-red-600 hover:to-habita-primary text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {propiedadesDisponibles.length === 0 ? 'Recargar' : 'Limpiar filtros'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 🔥 SECCIÓN: MAPA INTERACTIVO */}
     <section id="mapa-section" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
       <div className="container mx-auto px-4">
         <div className="text-center mb-12 animate-fade-in">
           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
             Explora en el <span className="text-habita-primary">Mapa</span>
           </h2>
           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
             Encuentra propiedades disponibles en Bolivia con ubicación exacta
           </p>
         </div>

         <GoogleMapsProperties
             propiedades={propiedadesDisponibles}
             onPropertyClick={(propiedad) => {
                 handleViewProperty(propiedad);
             }}
         />
       </div>
     </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-habita-secondary to-habita-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              ¿Listo para tu próxima{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                aventura?
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Únete a miles de viajeros que ya están descubriendo experiencias únicas con Habita
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-habita-primary hover:bg-gray-100 px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                onClick={() => window.location.href = '/register'}
              >
                Comenzar ahora
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-habita-primary px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('propiedades-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar propiedades
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-habita-secondary text-white py-16">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-habita-primary font-bold text-xl">H</span>
                          </div>
                          <div>
                              <h3 className="text-2xl font-bold">Habita</h3>
                              <p className="text-gray-400">Donde cada viaje se convierte en un hogar</p>
                          </div>
                      </div>
                      <p className="text-gray-400 max-w-md">
                          Conectamos viajeros con experiencias únicas alrededor del mundo. Tu próxima aventura te espera.
                      </p>
                  </div>

                  <div>
                      <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
                      <ul className="space-y-2 text-gray-400">
                          <li><a href="#propiedades-section" className="hover:text-white transition-colors">Propiedades</a></li>
                          <li><a href="#mapa-section" className="hover:text-white transition-colors">Mapa</a></li>
                          <li><a href="#categorias" className="hover:text-white transition-colors">Categorías</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="font-semibold mb-4">Síguenos</h4>
                      <div className="flex space-x-4">
                          {/* Iconos de redes sociales */}
                          <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-habita-primary transition-colors duration-300">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                              </svg>
                          </a>
                          <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                              </svg>
                          </a>
                          <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-300">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                          </a>
                          <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                          </a>
                      </div>
                  </div>
              </div>

              <Separator className="bg-gray-700 mb-8" />

              <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="text-gray-400 text-sm mb-4 md:mb-0">
                      © 2025 Habita. Todos los derechos reservados.
                  </div>
                  <div className="flex space-x-6 text-sm text-gray-400">
                      <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                      <a href="#" className="hover:text-white transition-colors">Términos</a>
                      <a href="#" className="hover:text-white transition-colors">Cookies</a>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;