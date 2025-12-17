import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useImageValidation = () => {
  const { toast } = useToast();

  const validateImage = async (file: File): Promise<ValidationResult> => {
    const errors: string[] = [];

    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      errors.push('El archivo debe ser una imagen');
    }

    if (file.size > 5 * 1024 * 1024) {
      errors.push('El archivo no debe superar los 5MB');
    }

    // Validación de contenido (básica)
    const isSuspicious = await checkImageContent(file);
    if (isSuspicious) {
      errors.push('La imagen no cumple con los estándares de contenido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const checkImageContent = async (file: File): Promise<boolean> => {
    // Aquí puedes integrar con servicios de moderación de contenido
    // Por ahora, una validación básica de proporciones
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Detectar imágenes potencialmente inapropiadas por relación de aspecto
        const aspectRatio = img.width / img.height;
        const isExtremeAspectRatio = aspectRatio > 3 || aspectRatio < 0.33;

        resolve(isExtremeAspectRatio);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(true); // Rechazar si no se puede cargar
      };

      img.src = url;
    });
  };

  return { validateImage };
};