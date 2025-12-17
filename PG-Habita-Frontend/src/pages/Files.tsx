import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import  AdminPhotoGallery from '@/components/admin/AdminPhotoGallery';
import  MyPhotoGallery  from '@/pages/MyPhotoGallery';

export default function Files() {
  const { user } = useAuth();

  // Si es admin, mostrar galería de administración
  // Si es usuario normal, mostrar su galería personal
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERUSER';

  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? (
        <AdminPhotoGallery />
      ) : (
        <MyPhotoGallery />
      )}
    </div>
  );
}