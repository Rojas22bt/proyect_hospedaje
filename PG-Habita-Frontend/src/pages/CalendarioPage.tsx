import React from 'react';
import CalendarioInteractivo from '@/components/calendario/CalendarioInteractivo';

const CalendarioPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <CalendarioInteractivo />
    </div>
  );
};

export default CalendarioPage;
