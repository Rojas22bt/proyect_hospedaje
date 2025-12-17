interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class AIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.apiUrl = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
  }

  async chat(messages: OpenAIMessage[]): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Error de la API: ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No se pudo obtener una respuesta.';
    } catch (error) {
      console.error('Error al llamar a la API de OpenAI:', error);
      throw error;
    }
  }

  async obtenerRecomendacionesEvento(evento: string, mes: string, lugar: string): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `Eres María, una guía turística local experta y amigable de Santa Cruz, Bolivia. Tienes años de experiencia ayudando a turistas. 
        Hablas de manera cálida, natural y entusiasta. Usa emojis ocasionalmente para dar vida a tus respuestas.
        Siempre eres específica y práctica en tus recomendaciones.`
      },
      {
        role: 'user',
        content: `Hola María, voy a visitar el evento "${evento}" en ${mes} en ${lugar}. ¿Qué me recomiendas? Me gustaría saber qué hacer, dónde hospedarme y algunos consejos útiles.`
      }
    ];

    return await this.chat(messages);
  }

  async buscarEventosPorInteres(interes: string, datos: any): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `Eres María, una guía turística local de Santa Cruz, Bolivia. Conoces todos los eventos de la región.
        Habla de forma amigable y entusiasta, como si estuvieras conversando con un amigo que visita tu ciudad.
        Usa emojis para dar énfasis y haz que tus recomendaciones sean memorables.`
      },
      {
        role: 'user',
        content: `María, estoy buscando ${interes}. Aquí están los eventos disponibles: ${JSON.stringify(datos).substring(0, 3000)}
        
¿Cuáles me recomiendas y por qué? Dame tus mejores 3-4 sugerencias con las fechas.`
      }
    ];

    return await this.chat(messages);
  }

  async obtenerConsejosHospedaje(tipoEvento: string, provincia: string): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'Eres un experto en hospedaje y turismo de Santa Cruz, Bolivia. Proporciona consejos prácticos y relevantes.'
      },
      {
        role: 'user',
        content: `Para un evento de tipo "${tipoEvento}" en la provincia de ${provincia}, ¿qué tipo de hospedaje recomiendas y qué debo considerar al reservar? (máximo 100 palabras)`
      }
    ];

    return await this.chat(messages);
  }

  async planificarItinerario(eventos: any[], preferencias: string): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'Eres un planificador de viajes experto. Crea itinerarios personalizados basados en eventos y preferencias del usuario.'
      },
      {
        role: 'user',
        content: `Eventos disponibles: ${JSON.stringify(eventos).substring(0, 2000)}
        
Preferencias del usuario: "${preferencias}"

Crea un itinerario sugerido con los mejores eventos a visitar, considerando fechas y ubicaciones. Incluye consejos de hospedaje. Máximo 250 palabras.`
      }
    ];

    return await this.chat(messages);
  }

  async responderPregunta(pregunta: string, contexto: any): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `Eres María, tu guía turística personal de Santa Cruz, Bolivia. Eres cálida, conocedora y siempre lista para ayudar.
        Respondes de forma conversacional, como si estuvieras chateando con un amigo.
        Usa emojis de forma natural para expresar entusiasmo.
        Si no tienes la información exacta, sé honesta pero ofrece alternativas útiles.`
      },
      {
        role: 'user',
        content: `Contexto: ${JSON.stringify(contexto).substring(0, 2000)}
        
Mi pregunta es: ${pregunta}`
      }
    ];

    return await this.chat(messages);
  }
}

export const aiService = new AIService();
