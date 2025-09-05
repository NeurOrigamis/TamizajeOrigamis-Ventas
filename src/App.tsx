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
    />
  );
}

export default App;