import React, { useEffect, useRef } from 'react';
import { MessageCircle, RefreshCw, Heart, AlertTriangle } from 'lucide-react';
import { sendToSheetForm } from '../lib/sheets';

interface ResultsScreenProps {
  result: 'green' | 'yellow' | 'red';
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
    title: 'VERDE – Bienestar Estable',
    emoji: '😀',
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-50 via-white to-emerald-50',
    interpretation: 'Tus respuestas indican un funcionamiento emocional dentro de rangos esperados (puntaje 0-17). Esto sugiere que cuentas con recursos de afrontamiento adecuados para las demandas cotidianas y mantienes un equilibrio general en tu bienestar psicológico.',
    professional: 'Un resultado verde indica capacidad de autorregulación emocional y manejo efectivo del estrés diario. Sin embargo, es importante monitorear áreas específicas que puedan requerir atención preventiva para mantener este estado de bienestar.',
    recommendation: 'Mantén tus hábitos actuales de autocuidado y considera fortalecer áreas específicas según tus subescalas. La prevención es clave para sostener tu bienestar a largo plazo.',
    whatsappMessage: 'Hola! Acabo de completar el Tamizaje Emocional y mi resultado fue VERDE - Bienestar Estable 🟩😀. Me gustaría obtener más información sobre recursos y herramientas prácticas para mantener mi bienestar.'
  },
  yellow: {
    color: '🟨',
    title: 'AMARILLO – Desgaste en Proceso',
    emoji: '😐',
    gradient: 'from-yellow-400 to-orange-500',
    bgGradient: 'from-yellow-50 via-white to-orange-50',
    interpretation: 'Tus respuestas sugieren un nivel moderado de malestar emocional (puntaje 18-19). Esto indica la presencia de síntomas que pueden estar interfiriendo con tu funcionamiento diario y requieren atención para prevenir un mayor deterioro.',
    professional: 'Este rango sugiere la necesidad de intervención temprana. La evidencia muestra que la atención oportuna en esta fase puede prevenir la progresión hacia niveles más severos de malestar y facilitar una recuperación más efectiva.',
    recommendation: 'Se recomienda una intervención breve estructurada que incluya psicoeducación, desarrollo de hábitos saludables y técnicas de regulación emocional. El apoyo profesional en esta etapa es altamente beneficioso.',
    whatsappMessage: 'Hola! Acabo de completar el Tamizaje Emocional y mi resultado fue AMARILLO - Desgaste en Proceso. Me interesa agendar una sesión de diagnóstico personal para recuperar mi equilibrio emocional.'
  },
  red: {
    color: '🟥',
    title: 'ROJO – Alerta Emocional',
    emoji: '😟',
    gradient: 'from-red-400 to-red-600',
    bgGradient: 'from-red-50 via-white to-pink-50',
    interpretation: 'Tus respuestas indican un nivel significativo de malestar emocional (puntaje ≥20). Esto sugiere la presencia de síntomas que probablemente están afectando considerablemente tu funcionamiento diario y bienestar general.',
    professional: 'Este nivel de puntuación indica la necesidad de evaluación clínica prioritaria. Los síntomas reportados requieren atención profesional especializada para una evaluación comprehensiva y el desarrollo de un plan de tratamiento adecuado.',
    recommendation: 'Se recomienda encarecidamente buscar evaluación clínica prioritaria con un profesional de salud mental. La intervención temprana es fundamental para abordar efectivamente los síntomas y prevenir mayor deterioro.',
    whatsappMessage: 'Hola! Acabo de completar el Tamizaje Emocional y mi resultado fue ROJO - Alerta Emocional. Me gustaría contactar con su equipo de apoyo de manera prioritaria para recibir asistencia profesional.'
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
      ? `Hola! Soy ${userData.name}, acabo de completar el Test de Estado Emocional y mi resultado fue ${data.title.split(' – ')[1]} ${data.color}. ${data.whatsappMessage.split('. ')[1]}`
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
              📊 Tu Semáforo Emocional
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">Análisis por áreas:</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">Estrés/Ansiedad</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreEstres, 'stress'))}`}>
                    {categoryScores.scoreEstres}/15
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">Ánimo/Anhedonia</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreAnimo, 'mood'))}`}>
                    {categoryScores.scoreAnimo}/15
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700 mb-2">Control/Rumiación</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getSubescaleStatus(categoryScores.scoreControl, 'control'))}`}>
                    {categoryScores.scoreControl}/15
                  </div>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                Lo que tus respuestas nos dicen:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.interpretation}
              </p>
            </div>

            {/* Professional Reading */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Una mirada experta:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.professional}
              </p>
            </div>

            {/* Triage Recommendation */}
            <div className={`bg-gradient-to-r ${triageRecommendation.priority === 'high' ? 'from-red-100 to-red-50' : triageRecommendation.priority === 'medium' ? 'from-yellow-100 to-yellow-50' : 'from-green-100 to-green-50'} rounded-2xl p-6`}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recomendación específica:
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Basado en tu puntuación y perfil de respuestas, se sugiere: <strong>{triageRecommendation.recommendation}</strong>
              </p>
              {triageRecommendation.type === 'clinical' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    ⚠️ Tu puntuación indica la necesidad de evaluación profesional prioritaria.
                  </p>
                </div>
              )}
            </div>

            {/* Recommendation */}
            <div className={`bg-gradient-to-r ${data.gradient} bg-opacity-10 rounded-2xl p-6`}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Próximos pasos:
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleWhatsAppContact}
                className={`flex-1 bg-gradient-to-r ${safetyAlert ? 'from-red-600 to-red-700' : data.gradient} text-white font-semibold py-4 px-8 rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{safetyAlert ? 'Contacto Prioritario' : 'Quiero acompañamiento'}</span>
              </button>

              <button
                onClick={onRestart}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Realizar Test Nuevamente</span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>
                ⚠️ IMPORTANTE: Este es un cuestionario de tamizaje, no un diagnóstico clínico.
              </p>
              <p>
                Los resultados son orientativos y no reemplazan la evaluación de un profesional de la salud mental.
                Si experimentas malestar significativo o persistente, busca ayuda profesional.
              </p>
              {safetyAlert && (
                <p className="text-red-600 font-medium mt-2">
                  Si tienes pensamientos de autolesión, contacta inmediatamente: Salud Responde 600 360 7777 o acude a urgencias.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};