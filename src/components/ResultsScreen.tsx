import React, { useEffect, useRef } from 'react';
import { MessageCircle, RefreshCw, Heart, AlertTriangle } from 'lucide-react';
import { sendToSheetForm } from '../lib/sheets';

interface ResultsScreenProps {
  result: 'green' | 'yellow' | 'orange' | 'red';
  score: number;
  categoryScores: {
    scoreEstres: number;
    scoreAnimo: number;
    scoreControl: number;
  };
  triageRecommendation: {
    priority: string;
    recommendation: string;
    type: string;
  };
  sessionId: string;
  userData: { name: string; email: string } | null;
  safetyAlert?: boolean;
  safetyQuestionAnswer?: number | string | null;
  webAppUrl: string;
  onRestart: () => void;
}

const resultData = {
  green: {
    color: '🟩',
    title: '¡Todo bien! 🌟 Estás en verde',
    emoji: '😀',
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-50 via-white to-emerald-50',
    interpretation: '¡Qué bueno! 😊 Tus respuestas muestran que estás manejando bien las cosas del día a día. Tienes buenas herramientas para lidiar con el estrés y mantienes un buen equilibrio emocional. ¡Sigue así! 💪',
    professional: 'Tu resultado verde significa que tienes buena capacidad para manejar tus emociones y el estrés diario 🧠✨. Aunque estés bien, siempre es bueno estar atento a cómo te sientes para mantener este bienestar.',
    recommendation: 'Sigue haciendo lo que estás haciendo 👏. Mantén tus buenos hábitos y tal vez puedas mejorar en algunas áreas específicas. ¡La prevención es la clave! 🔑',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en VERDE 🟩😀. Me gustaría saber más sobre cómo mantener mi bienestar y seguir mejorando.'
  },
  yellow: {
    color: '🟨',
    title: 'Ojo aquí 👀 Estás en amarillo',
    emoji: '😐',
    gradient: 'from-yellow-400 to-orange-500',
    bgGradient: 'from-yellow-50 via-white to-orange-50',
    interpretation: 'Mmm, parece que las cosas se están poniendo un poquito pesadas 😅. Tus respuestas muestran que hay algunas cositas que te están afectando más de lo normal. No es grave, pero sí es momento de poner atención 🚨.',
    professional: 'Tu resultado amarillo nos dice que es buen momento para actuar 🎯. Si le ponemos atención ahora, podemos evitar que las cosas se compliquen más adelante. ¡Es súper normal y tiene solución! 💡',
    recommendation: 'Te recomendamos buscar un poco de apoyo profesional 🤝. Unas sesiones cortas pueden ayudarte muchísimo a recuperar tu equilibrio. ¡No esperes más! ⏰',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en AMARILLO 🟨. Me gustaría agendar una sesión para recuperar mi equilibrio emocional.'
  },
  orange: {
    color: '🟧',
    title: 'Alerta moderada 🔶 Estás en naranjo',
    emoji: '😰',
    gradient: 'from-orange-400 to-red-500',
    bgGradient: 'from-orange-50 via-white to-red-50',
    interpretation: 'Oye, las cosas se están poniendo complicadas 😰. Tus respuestas nos muestran que hay varias áreas que te están afectando bastante. Es momento de tomar acción más decidida 💪.',
    professional: 'Tu resultado naranjo indica que necesitas apoyo profesional pronto 🎯. Los síntomas que describes están impactando tu día a día de manera significativa, pero con ayuda adecuada puedes mejorar mucho 🌟.',
    recommendation: 'Te recomendamos buscar ayuda profesional en las próximas semanas 📅. No esperes a que las cosas empeoren, es el momento perfecto para actuar 🚀.',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en NARANJO 🟧. Necesito agendar una evaluación profesional pronto para mejorar mi situación.'
  },
  red: {
    color: '🟥',
    title: 'Necesitas apoyo ya 🚨 Estás en rojo',
    emoji: '😟',
    gradient: 'from-red-400 to-red-600',
    bgGradient: 'from-red-50 via-white to-pink-50',
    interpretation: 'Hey, sabemos que las cosas están difíciles ahora mismo 💔. Tus respuestas nos muestran que realmente necesitas apoyo profesional. No estás solo/a en esto y hay ayuda disponible 🤗.',
    professional: 'Tu resultado rojo nos dice que es súper importante que busques ayuda profesional pronto 🏥💜. Los síntomas que describes están afectando tu día a día, pero con el apoyo adecuado puedes sentirte mejor.',
    recommendation: 'Por favor, busca ayuda profesional lo antes posible 🙏. Un psicólogo o psiquiatra puede ayudarte muchísimo. ¡No lo dejes para después! Tu bienestar es lo más importante 💝.',
    whatsappMessage: 'Hola! Acabo de hacer el test emocional y salí en ROJO 🟥. Necesito contactar con su equipo de apoyo de manera prioritaria para recibir ayuda profesional.'
  }
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  result, 
  score, 
  categoryScores, 
  triageRecommendation, 
  sessionId, 
  userData, 
  safetyAlert = false, 
  safetyQuestionAnswer,
  webAppUrl,
  onRestart 
}) => {
  const data = resultData[result];
  const sentRef = useRef(false);

  // Enviar datos a Google Sheets después de renderizar
  useEffect(() => {
    if (sentRef.current) return; // evita doble ejecución (StrictMode / re-render)
    sentRef.current = true;

    if (userData) {
      void sendToSheetForm({
        timestamp: new Date().toISOString(),
        nombre: userData.name,
        email: userData.email,
        sessionId,
        userAgent: navigator.userAgent,
        scoreTotal: score,
        scoreEstres: categoryScores.scoreEstres,
        scoreAnimo: categoryScores.scoreAnimo,
        scoreConfianza: categoryScores.scoreControl,
        safetyQuestionAnswer: safetyQuestionAnswer ?? '',
        webAppUrl
      });
    }
  }, [userData, sessionId, score, categoryScores, safetyQuestionAnswer, webAppUrl]);
  
  const handleWhatsAppContact = () => {
    const phoneNumber = '56930179724';
    const personalizedMessage = userData 
      ? `Hola! Soy ${userData.name}, acabo de completar el Test de Estado Emocional y ${data.whatsappMessage}`
      : data.whatsappMessage;
    const message = encodeURIComponent(personalizedMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Función para determinar el estado de las subescalas
  const getSubescaleStatus = (score: number, type: 'stress' | 'mood' | 'control') => {
    if (type === 'stress') {
      return score >= 6 ? 'red' : score >= 5 ? 'yellow' : 'green';
    } else if (type === 'mood') {
      return score >= 5 ? 'red' : score >= 5 ? 'yellow' : 'green';
    } else { // control
      return score >= 7 ? 'red' : score >= 5 ? 'yellow' : 'green';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red': return 'text-red-600 bg-red-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${data.bgGradient} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Safety Alert Banner */}
          {safetyAlert && (
            <div className="bg-red-600 text-white p-6">
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 mr-3" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Atención Prioritaria Requerida</h3>
                  <p className="text-sm mt-1">
                    Hemos detectado indicadores que requieren atención inmediata. Te recomendamos contactar con un profesional de la salud mental.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className={`bg-gradient-to-r ${data.gradient} p-8 text-white text-center`}>
            <div className="text-6xl mb-4">{data.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              🎯 ¡Aquí están tus resultados!
            </h1>
            <div className="text-xl opacity-90">
              {data.color} {data.title}
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            {/* Score */}
            <div className="text-center">
              {userData && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Hola {userData.name} 👋
                  </h3>
                  <p className="text-gray-600">Aquí están tus resultados personalizados</p>
                </div>
              )}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-2xl font-bold text-gray-700">{score}</span>
              </div>
              <p className="text-gray-600">Puntuación total de 45 puntos posibles</p>
            </div>

            {/* Subescales */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Cómo te fue en cada área:</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">😰 Estrés/Ansiedad</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreEstres, 'stress'))}`}>
                    {categoryScores.scoreEstres}/15
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">😔 Ánimo/Energía</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreAnimo, 'mood'))}`}>
                    {categoryScores.scoreAnimo}/15
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">🧠 Control Mental</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreControl, 'control'))}`}>
                    {categoryScores.scoreControl}/15
                  </div>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                💬 En palabras simples:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.interpretation}
              </p>
            </div>

            {/* Professional Reading */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🔍 Lo que esto significa:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.professional}
              </p>
            </div>

            {/* Triage Recommendation */}
            <div className={`bg-gradient-to-r ${
              triageRecommendation.priority === 'high' ? 'from-red-100 to-red-50' : 
              triageRecommendation.priority === 'medium-high' ? 'from-orange-100 to-orange-50' :
              triageRecommendation.priority === 'medium' ? 'from-yellow-100 to-yellow-50' : 
              'from-green-100 to-green-50'
            } rounded-2xl p-6`}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                💡 Nuestra recomendación:
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Basado en tus respuestas, te sugerimos: <strong>{triageRecommendation.recommendation}</strong> 🎯
              </p>
              {(triageRecommendation.type === 'clinical' || triageRecommendation.type === 'clinical-recommended') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    {triageRecommendation.type === 'clinical' ? 
                      '🚨 Es importante que busques ayuda profesional pronto.' :
                      '⚠️ Te recomendamos considerar una evaluación profesional.'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Recommendation */}
            <div className={`bg-gradient-to-r ${data.gradient} bg-opacity-10 rounded-2xl p-6`}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🚀 ¿Qué hacer ahora?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {/* Botón de psiquiatría - solo para resultado rojo */}
              {result === 'red' && (
                <button
                  onClick={() => window.open('https://www.origamis.cl/psiquiatria/', '_blank')}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-4 px-8 rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5" />
                  <span>🏥 agendar hora ya!</span>
                </button>
              )}

              {/* Botón de WhatsApp - siempre visible */}
              <button
                onClick={handleWhatsAppContact}
                className={`flex-1 bg-gradient-to-r ${data.gradient} text-white font-semibold py-4 px-8 rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>💬 Quiero conversar</span>
              </button>

              {/* Botón de reiniciar - siempre visible */}
              <button
                onClick={onRestart}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>🔄 Hacer el test otra vez</span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>
                ⚠️ IMPORTANTE: Este test es solo una orientación, no es un diagnóstico médico.
              </p>
              <p>
                Si te sientes mal o tienes dudas, siempre es mejor hablar con un profesional 👩‍⚕️👨‍⚕️
              </p>
              {safetyAlert && (
                <p className="text-red-600 font-medium mt-2">
                  🚨 Si tienes pensamientos de hacerte daño, llama ya: Salud Responde 600 360 7777 o ve a urgencias.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};