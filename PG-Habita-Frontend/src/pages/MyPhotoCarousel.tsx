// src/pages/MyPhotoCarousel.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PhotoCarousel from '@/components/admin/PhotoCarousel';
import api from '@/services/api';

export default function MyPhotoCarousel({ propiedad, onClose, onDeleteFile, onDownloadFile }) {
  // Este componente siempre se renderiza, pero controla su visibilidad internamente
  const { data: files = [] } = useQuery({
    queryKey: ['propiedad-files', propiedad?.id],
    queryFn: () => propiedad ? api.fetchFilesByPropiedad(propiedad.id) : [],
    enabled: !!propiedad,
  });

  // Si no hay propiedad seleccionada, no renderizar nada
  if (!propiedad) {
    return null;
  }

  return (
    <PhotoCarousel
      files={files}
      isOpen={true}
      onClose={onClose}
      onDeleteFile={onDeleteFile}
      onDownloadFile={onDownloadFile}
      showAdminActions={true}
    />
  );
}