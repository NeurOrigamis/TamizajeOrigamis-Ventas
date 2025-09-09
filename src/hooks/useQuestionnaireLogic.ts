import { useState, useCallback } from 'react';
import { questions, Question, safetyQuestion } from '../data/questions';

export type AnswerValue = 0 | 1 | 2 | 3; // 0=Nunca o 1 día, 1=Varios días (2-6), 2=Más de la mitad (7-11), 3=Casi todos los días (12-14)
export type ResultType = 'green' | 'yellow' | 'orange' | 'red';

export interface Answer {
  questionId: number;
  value: AnswerValue;
}

export interface SafetyAnswer {
  questionId: string;
  value: AnswerValue;
}

export const useQuestionnaireLogic = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [safetyAnswer, setSafetyAnswer] = useState<SafetyAnswer | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSafetyQuestion, setShowSafetyQuestion] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const currentQuestion = showSafetyQuestion ? null : questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const currentAnswer = showSafetyQuestion 
    ? safetyAnswer?.value ?? null
    : answers.find(a => a.questionId === currentQuestion?.id)?.value ?? null;

  const answerQuestion = useCallback((value: AnswerValue) => {
    if (showSafetyQuestion) {
      setSafetyAnswer({ questionId: safetyQuestion.id, value });
    } else {
      setAnswers(prev => {
        const existing = prev.findIndex(a => a.questionId === currentQuestion.id);
        const newAnswer: Answer = { questionId: currentQuestion.id, value };
        
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = newAnswer;
          return updated;
        } else {
          return [...prev, newAnswer];
        }
      });
    }
  }, [currentQuestion, showSafetyQuestion]);

  const goToNextQuestion = useCallback(() => {
    if (showSafetyQuestion) {
      // Verificar si hay alerta de seguridad solo cuando el usuario confirma su respuesta
      if (safetyAnswer && safetyAnswer.value >= 1) {
        setSafetyAlert(true);
      }
      setIsCompleted(true);
    } else if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Terminamos las preguntas principales, ahora mostramos la pregunta de seguridad
      setShowSafetyQuestion(true);
    }
  }, [currentQuestionIndex, totalQuestions, showSafetyQuestion, safetyAnswer]);

  const goToPreviousQuestion = useCallback(() => {
    if (showSafetyQuestion) {
      setShowSafetyQuestion(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex, showSafetyQuestion]);

  const calculateResult = useCallback((): { result: ResultType; score: number } => {
    // Calculamos el puntaje considerando ítems invertidos
    const totalScore = answers.reduce((sum, answer) => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question?.isReversed) {
        // Para ítems invertidos, invertimos la puntuación: 0->3, 1->2, 2->1, 3->0
        return sum + (3 - answer.value);
      }
      return sum + answer.value;
    }, 0);
    
    // Puntos de corte distribuidos equitativamente:
    // 0-11: Verde (Bienestar Estable)
    // 12-22: Amarillo (Desgaste en Proceso)
    // 23-33: Naranjo (Alerta Moderada)
    // 34-45: Rojo (Alerta Emocional)
    let result: ResultType;
    
    if (totalScore <= 11) {
      result = 'green';
    } else if (totalScore <= 22) {
      result = 'yellow';
    } else if (totalScore <= 33) {
      result = 'orange';
    } else {
      result = 'red';
    }

    return { result, score: totalScore };
  }, [answers]);

  const calculateCategoryScores = useCallback(() => {
    const stressQuestions = [1, 2, 3, 4, 5]; // E1-E5
    const moodQuestions = [6, 7, 8, 9, 10]; // A1-A5
    const cognitiveQuestions = [11, 12, 13, 14, 15]; // C1-C5

    const scoreEstres = answers
      .filter(answer => stressQuestions.includes(answer.questionId))
      .reduce((sum, answer) => sum + answer.value, 0);

    const scoreAnimo = answers
      .filter(answer => moodQuestions.includes(answer.questionId))
      .reduce((sum, answer) => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question?.isReversed) {
          return sum + (3 - answer.value);
        }
        return sum + answer.value;
      }, 0);

    const scoreControl = answers
      .filter(answer => cognitiveQuestions.includes(answer.questionId))
      .reduce((sum, answer) => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question?.isReversed) {
          return sum + (3 - answer.value);
        }
        return sum + answer.value;
      }, 0);

    return { scoreEstres, scoreAnimo, scoreControl };
  }, [answers]);

  const getTriageRecommendation = useCallback(() => {
    const { result, score } = calculateResult();
    const { scoreEstres, scoreAnimo, scoreControl } = calculateCategoryScores();
    
    // Determinar estado de subescalas
    const estresStatus = scoreEstres >= 6 ? 'red' : scoreEstres >= 5 ? 'yellow' : 'green';
    const animoStatus = scoreAnimo >= 5 ? 'red' : scoreAnimo >= 5 ? 'yellow' : 'green';
    const controlStatus = scoreControl >= 7 ? 'red' : scoreControl >= 5 ? 'yellow' : 'green';
    
    const redSubescales = [estresStatus, animoStatus, controlStatus].filter(s => s === 'red').length;
    const yellowSubescales = [estresStatus, animoStatus, controlStatus].filter(s => s === 'yellow').length;
    
    // Reglas de triage basadas en el resultado
    if (result === 'red') {
      return {
        priority: 'high',
        recommendation: 'evaluación clínica prioritaria',
        type: 'clinical'
      };
    } else if (result === 'orange') {
      return {
        priority: 'medium-high',
        recommendation: 'evaluación clínica recomendada',
        type: 'clinical-recommended'
      };
    } else if (result === 'yellow') {
      return {
        priority: 'medium',
        recommendation: 'intervención breve estructurada',
        type: 'structured'
      };
    } else {
      return {
        priority: 'low',
        recommendation: 'recomendaciones específicas de autocuidado',
        type: 'selfcare'
      };
    }
  }, [calculateResult, calculateCategoryScores]);

  const resetQuestionnaire = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSafetyAnswer(null);
    setIsCompleted(false);
    setShowSafetyQuestion(false);
    setSafetyAlert(false);
  }, []);

  const canGoNext = currentAnswer !== null;
  const canGoPrevious = currentQuestionIndex > 0 || showSafetyQuestion;

  return {
    currentQuestion: showSafetyQuestion ? safetyQuestion : currentQuestion,
    currentQuestionIndex: showSafetyQuestion ? totalQuestions + 1 : currentQuestionIndex,
    totalQuestions: totalQuestions + 1, // +1 para incluir la pregunta de seguridad
    currentAnswer,
    answers,
    safetyAnswer,
    isCompleted,
    showSafetyQuestion,
    safetyAlert,
    sessionId,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    calculateResult,
    calculateCategoryScores,
    getTriageRecommendation,
    resetQuestionnaire,
    canGoNext,
    canGoPrevious
  };
};