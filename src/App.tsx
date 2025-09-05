import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegistrationForm } from './components/RegistrationForm';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { useQuestionnaireLogic } from './hooks/useQuestionnaireLogic';

type AppState = 'welcome' | 'registration' | 'questionnaire' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentAnswer,
    isCompleted,
    sessionId,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    calculateResult,
    calculateCategoryScores,
    resetQuestionnaire,
    canGoNext,
    canGoPrevious
  } = useQuestionnaireLogic();

  const handleStart = () => {
    setAppState('registration');
  };

  const handleRegister = (name: string, email: string) => {
    setUserData({ name, email });
    setAppState('questionnaire');
  };

  const handleSubmitResults = async () => {
    if (userData) {
      try {
        const { result, score } = calculateResult();
        const categoryScores = calculateCategoryScores();
        
        // Crear datos como URLSearchParams para form-urlencoded
        const formData = new URLSearchParams({
          timestamp: new Date().toISOString(),
          nombre: userData.name,
          email: userData.email,
          sessionId: sessionId,
          userAgent: navigator.userAgent,
          scoreTotal: String(score),
          scoreEstres: String(categoryScores.scoreEstres),
          scoreAnimo: String(categoryScores.scoreAnimo),
          scoreConfianza: String(categoryScores.scoreConfianza)
        });

        await fetch('https://script.google.com/macros/s/AKfycbxa8lueCpycqO11V9z0ThpzVAIoZEkidrV-98v6rfaySvKEdLRMYu-tnRrWZK_M12fZ8Q/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: formData.toString()
        });
        
        console.log('Datos enviados exitosamente como form-urlencoded');
      } catch (error) {
        console.error('Error al enviar datos:', error);
      }
    }
  };

  const handleNext = () => {
    goToNextQuestion();
    if (isCompleted) {
      setAppState('results');
    }
  };

  const handleRestart = () => {
    resetQuestionnaire();
    setUserData(null);
    setAppState('welcome');
  };

  if (appState === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (appState === 'registration') {
    return <RegistrationForm onRegister={handleRegister} />;
  }

  if (appState === 'results') {
    const { result, score } = calculateResult();
    const categoryScores = calculateCategoryScores();
    return (
      <ResultsScreen 
        result={result} 
        score={score} 
        categoryScores={categoryScores}
        sessionId={sessionId}
        userData={userData}
        onRestart={handleRestart} 
      />
    );
  }

  // Questionnaire state
  return (
    <QuestionCard
      question={currentQuestion.text}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={totalQuestions}
      category={currentQuestion.category}
      selectedAnswer={currentAnswer}
      onAnswerSelect={answerQuestion}
      onNext={handleNext}
      onPrevious={goToPreviousQuestion}
      canGoNext={canGoNext}
      canGoPrevious={canGoPrevious}
      onSubmitResults={handleSubmitResults}
    />
  );
}

export default App;