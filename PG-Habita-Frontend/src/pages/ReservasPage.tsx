import React, { useState } from 'react';
import { ReservaConDetalles, ReservaFormData, Reserva } from '@/types/auth';
import { useReservas } from '@/hooks/useReservas';
import ReservaList from '@/components/reservas/ReservaList';
import ReservaForm from '@/components/reservas/ReservaForm';
import ReservaDetails from '@/components/reservas/ReservaDetails';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

const ReservasPage: React.FC = () => {
  const { user } = useAuth();
  const {
    reservas,
    useReserva,
    createReserva,
    updateReserva,
    anularReserva,
    isCreating,
    isUpdating,
    isAnulando,
    isLoading,
  } = useReservas();

  const [currentReserva, setCurrentReserva] = useState<ReservaConDetalles | null>(null);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');


  const {
    data: reservaDetalle,
    isLoading: isLoadingDetalle
  } = useReserva(selectedReservaId || 0);

  // 🔥 Verificar permisos basados en el rol
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERUSER';
  const canCreateEdit = isAdmin; // Solo admin puede crear/editar

  const handleCreate = () => {
    if (!canCreateEdit) {
      console.warn('❌ Usuario no tiene permisos para crear reservas');
      return;
    }

    setCurrentReserva(null);
    setSelectedReservaId(null);
    setViewMode('create');
  };

  const handleEdit = (reserva: Reserva | ReservaConDetalles) => {
    if (!canCreateEdit) {
      console.warn('❌ Usuario no tiene permisos para editar reservas');
      return;
    }

    // Convertir a ReservaConDetalles básica
    const reservaCompleta: ReservaConDetalles = {
      ...reserva,
      usuario: 'usuario' in reserva ? (reserva as ReservaConDetalles).usuario : undefined,
      propiedadInfo: 'propiedadInfo' in reserva ? (reserva as ReservaConDetalles).propiedadInfo : undefined
    };

    setCurrentReserva(reservaCompleta);
    setSelectedReservaId(null);
    setViewMode('edit');
  };

  const handleView = (reserva: Reserva | ReservaConDetalles) => {
    setSelectedReservaId(reserva.id);
    setViewMode('view');

    // Mostrar datos básicos mientras se cargan los detalles
    const reservaBasica: ReservaConDetalles = {
      ...reserva,
      usuario: 'usuario' in reserva ? (reserva as ReservaConDetalles).usuario : undefined,
      propiedadInfo: 'propiedadInfo' in reserva ? (reserva as ReservaConDetalles).propiedadInfo : undefined
    };
    setCurrentReserva(reservaBasica);
  };

  const handleBackToList = () => {
    setCurrentReserva(null);
    setSelectedReservaId(null);
    setViewMode('list');
  };

  const handleSubmit = async (data: ReservaFormData) => {
    if (!user?.id) {
      console.error('❌ No se pudo obtener el ID del usuario');
      return;
    }

    const submitData = {
      ...data,
      user: user.id,
    };

    try {
      if (currentReserva) {
        await updateReserva({ id: currentReserva.id, data: submitData });
      } else {
        await createReserva(submitData);
      }
      handleBackToList();
    } catch (error) {
      console.error('Error al guardar reserva:', error);
    }
  };

  const handleAnular = (reservaId: number) => {
    if (!canCreateEdit) {
      console.warn('❌ Usuario no tiene permisos para anular reservas');
      return;
    }

    anularReserva(reservaId);
    handleBackToList();
  };


  const displayReserva = viewMode === 'view' && reservaDetalle
    ? reservaDetalle
    : currentReserva;

  if (isLoading && viewMode === 'list') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-habita-primary" />
          <span className="ml-2 text-lg">Cargando reservas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Botón de volver para vistas que no son lista */}
        {viewMode !== 'list' && (
          <Button
            onClick={handleBackToList}
            variant="ghost"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </Button>
        )}

        {viewMode === 'list' && (
          <ReservaList
            onEdit={canCreateEdit ? handleEdit : undefined}
            onView={handleView}
            onCreate={canCreateEdit ? handleCreate : undefined}
            canCreateEdit={canCreateEdit}
          />
        )}

        {viewMode === 'create' && canCreateEdit && (
          <ReservaForm
            onSubmit={handleSubmit}
            onCancel={handleBackToList}
            isLoading={isCreating}
          />
        )}

        {viewMode === 'edit' && currentReserva && canCreateEdit && (
          <ReservaForm
            reserva={currentReserva}
            onSubmit={handleSubmit}
            onCancel={handleBackToList}
            isLoading={isUpdating}
          />
        )}

        {viewMode === 'view' && selectedReservaId && (
          <ReservaDetails
            reservaId={selectedReservaId}
            reserva={displayReserva || undefined}
            onClose={handleBackToList}
            onEdit={canCreateEdit ? (() => displayReserva && handleEdit(displayReserva)) : undefined}
            onAnular={canCreateEdit ? (() => handleAnular(selectedReservaId)) : undefined}
            isLoading={isLoadingDetalle}
            canEdit={canCreateEdit}
            isAnulando={isAnulando}
          />
        )}
      </div>
    </div>
  );
};

export default ReservasPage;