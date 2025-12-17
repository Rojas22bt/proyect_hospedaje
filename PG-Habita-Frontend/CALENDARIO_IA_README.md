# 🤖 Calendario Inteligente con IA

## 📋 Descripción

El Calendario de Eventos ahora cuenta con un **Asistente Inteligente** potenciado por OpenAI que ayuda a los usuarios a descubrir mejores eventos y hospedajes en Santa Cruz, Bolivia.

## ✨ Características Principales

### 1. **Recomendaciones Automáticas de Eventos**
- Al seleccionar un evento, la IA genera automáticamente recomendaciones personalizadas
- Incluye consejos sobre qué hacer, dónde hospedarse y tips para visitantes
- Información contextual basada en el evento, fecha y ubicación

### 2. **Asistente IA Flotante**
- Botón flotante con icono de ✨ Sparkles en la esquina inferior derecha
- Panel de chat interactivo para hacer preguntas en lenguaje natural
- Respuestas inteligentes sobre eventos, hospedajes y recomendaciones

### 3. **Búsqueda Inteligente por Intereses**
- Botones de acceso rápido para categorías populares:
  - 🎭 Eventos Culturales
  - ⛪ Eventos Religiosos
  - 📜 Eventos Históricos
  - 🌿 Naturaleza
- La IA analiza todos los eventos y recomienda los más relevantes

### 4. **Preguntas Frecuentes**
Ejemplos de preguntas que puedes hacer al asistente:
- "¿Qué eventos hay en febrero?"
- "¿Dónde hospedarme para el Carnaval?"
- "Recomiéndame eventos culturales"
- "¿Cuál es el mejor mes para visitar Santa Cruz?"
- "¿Qué tipo de hospedaje necesito para eventos religiosos?"

## 🔧 Configuración

### Variables de Entorno

Las siguientes variables están configuradas en el archivo `.env`:

```env
```

### Archivos Nuevos Creados

1. **`src/services/ai.service.ts`** - Servicio de IA
   - `obtenerRecomendacionesEvento()` - Recomendaciones automáticas para eventos
   - `buscarEventosPorInteres()` - Búsqueda por categorías de interés
   - `obtenerConsejosHospedaje()` - Consejos específicos de hospedaje
   - `planificarItinerario()` - Planificación de viajes
   - `responderPregunta()` - Respuestas a preguntas generales

2. **Actualización de `CalendarioInteractivo.tsx`**
   - Integración completa del asistente IA
   - UI mejorada con animaciones y feedback visual
   - Panel flotante de chat interactivo

## 🎨 Interfaz de Usuario

### Elementos Visuales Nuevos

1. **Botón Flotante**
   - Posición: Esquina inferior derecha
   - Icono: Sparkles (✨)
   - Al hacer clic: Abre/cierra el panel de IA

2. **Panel de Asistente**
   - Diseño: Card con gradiente morado-rosa
   - Campo de texto para preguntas
   - Área de respuestas con formato
   - Ejemplos de preguntas sugeridas

3. **Recomendaciones en Modal de Evento**
   - Sección dedicada para recomendaciones de IA
   - Se carga automáticamente al abrir un evento
   - Indicador de carga con spinner

4. **Botones de Búsqueda Rápida**
   - Ubicados en la pantalla inicial
   - 4 categorías predefinidas
   - Activan búsqueda inteligente al instante

## 🚀 Uso

### Para Usuarios

1. **Explorar Eventos con IA**:
   - Abre el calendario en `http://localhost:5173/calendario`
   - Haz clic en cualquier mes para ver eventos
   - Selecciona un evento para ver recomendaciones automáticas de IA

2. **Hacer Preguntas al Asistente**:
   - Haz clic en el botón ✨ flotante
   - Escribe tu pregunta en lenguaje natural
   - Presiona Enter o el botón "Preguntar"
   - Recibe respuestas personalizadas

3. **Búsqueda Rápida**:
   - Desde la pantalla principal, haz clic en las categorías sugeridas
   - La IA analizará todos los eventos y te mostrará los más relevantes

### Para Desarrolladores

```typescript
// Importar el servicio
import { aiService } from '@/services/ai.service';

// Obtener recomendaciones
const recomendacion = await aiService.obtenerRecomendacionesEvento(
  'Carnaval de Santa Cruz',
  'Febrero',
  'Santa Cruz de la Sierra'
);

// Buscar por interés
const eventos = await aiService.buscarEventosPorInteres(
  'eventos culturales',
  datosCalendario
);

// Hacer pregunta personalizada
const respuesta = await aiService.responderPregunta(
  '¿Qué eventos hay en diciembre?',
  datosCalendario
);
```

## 🔒 Seguridad

- Las API Keys están almacenadas en variables de entorno
- No se exponen en el código del cliente
- Las solicitudes se hacen directamente desde el navegador a OpenAI
- **⚠️ Importante**: En producción, considera usar un backend proxy para proteger las API keys

## 📊 Modelo de IA

- **Modelo**: GPT-4o-mini
- **Temperatura**: 0.7 (balance entre creatividad y precisión)
- **Max Tokens**: 1000 (respuestas concisas y relevantes)
- **Contexto**: Los eventos y datos del calendario se envían como contexto

## 🎯 Beneficios

1. **Mejor Experiencia de Usuario**
   - Descubrimiento inteligente de eventos
   - Recomendaciones personalizadas
   - Respuestas instantáneas a preguntas

2. **Mayor Engagement**
   - Interacción conversacional natural
   - Exploración guiada del calendario
   - Sugerencias proactivas

3. **Valor Agregado**
   - Información contextual enriquecida
   - Consejos de hospedaje personalizados
   - Planificación de viajes asistida por IA

## 🐛 Troubleshooting

### La IA no responde

1. Verifica que las variables de entorno estén configuradas correctamente
2. Comprueba tu conexión a internet
3. Verifica que la API key de OpenAI sea válida y tenga créditos

### Errores de CORS

Si experimentas errores de CORS, considera implementar un proxy en el backend:

```python
# Backend Django - views.py
from django.http import JsonResponse
import requests

def openai_proxy(request):
    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {settings.OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        },
        json=request.json()
    )
    return JsonResponse(response.json())
```

## 🔄 Actualizaciones Futuras

- [ ] Historial de conversaciones
- [ ] Sugerencias proactivas basadas en preferencias del usuario
- [ ] Integración con sistema de reservas
- [ ] Traducción automática a otros idiomas
- [ ] Voice input para preguntas
- [ ] Generación de itinerarios completos

## 📝 Notas

- Las respuestas de la IA son generadas en tiempo real
- El modelo aprende del contexto proporcionado (eventos disponibles)
- Las recomendaciones se actualizan con cada consulta
- La interfaz es totalmente responsive y funciona en móviles

## 🤝 Contribuciones

Para mejorar el asistente de IA:

1. Ajusta los prompts en `ai.service.ts`
2. Modifica los parámetros del modelo (temperatura, max_tokens)
3. Agrega nuevas funciones de consulta según necesidades
4. Mejora la UI del panel de chat

---

**¡Disfruta explorando eventos con inteligencia artificial! 🎉✨**
