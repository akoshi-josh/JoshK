import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { saveQuizResult } from "../utils/storage";

export default function TakeQuiz() {
  const { quizData } = useLocalSearchParams();
  const router = useRouter();
  const quiz = JSON.parse(quizData);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    quiz.timerEnabled ? quiz.timerDuration : null,
  );
  const [answers, setAnswers] = useState([]);
  const [quizStartTime] = useState(Date.now());
  const [quizEndTime, setQuizEndTime] = useState(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  useEffect(() => {
    const allAnswers = [
      { text: currentQuestion.correctAnswer, isCorrect: true },
      ...currentQuestion.wrongAnswers.map((wa) => ({
        text: wa,
        isCorrect: false,
      })),
    ];
    setShuffledAnswers(allAnswers.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
  }, [currentQuestionIndex]);

  // Play audio automatically when question changes (for audio type)
  useEffect(() => {
    if (quiz.type === "audio" && currentQuestion.question) {
      playAudio();
    }

    return () => {
      Speech.stop(); // Stop speech when component unmounts or question changes
    };
  }, [currentQuestionIndex]);

  // Cleanup speech when leaving the quiz
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (quiz.timerEnabled && timeLeft > 0 && !selectedAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !selectedAnswer) {
      handleAnswerSelect(null);
    }
  }, [timeLeft, selectedAnswer]);

  const playAudio = async () => {
    await Speech.stop(); // Stop any ongoing speech

    Speech.speak(currentQuestion.question, {
      language: "ko-KR", // Korean language
      pitch: 1.0,
      rate: 0.75, // Slightly slower for better comprehension
    });
  };

  const handleAnswerSelect = async (answer) => {
    if (selectedAnswer !== null) return;

    // Stop audio when answer is selected
    await Speech.stop();

    setSelectedAnswer(answer);

    const isCorrect = answer?.isCorrect || false;

    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([
      ...answers,
      {
        question: currentQuestion.question,
        selectedAnswer: answer?.text || "No answer (Time out)",
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect,
      },
    ]);

    setTimeout(() => {
      handleNextQuestion();
    }, 800);
  };

  const handleNextQuestion = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(quiz.timerEnabled ? quiz.timerDuration : null);
        fadeAnim.setValue(1);
      } else {
        const endTime = Date.now();
        setQuizEndTime(endTime);
        saveQuizToHistory(endTime);
        setShowResult(true);
      }
    });
  };

  const saveQuizToHistory = async (endTime) => {
    const timeTaken = endTime - quizStartTime;
    const percentage = ((score / quiz.questions.length) * 100).toFixed(0);

    const quizResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: quiz.title,
      type: quiz.type,
      score: score,
      totalQuestions: quiz.questions.length,
      percentage: parseFloat(percentage),
      timeTaken: timeTaken,
      timerEnabled: quiz.timerEnabled,
      answers: answers,
      questions: quiz.questions,
    };

    await saveQuizResult(quizResult);
  };

  const renderQuestionContent = () => {
    switch (quiz.type) {
      case "images":
        return currentQuestion.media ? (
          <Image
            source={{ uri: currentQuestion.media }}
            style={styles.questionImage}
            resizeMode="contain"
          />
        ) : null;
      case "audio":
        return (
          <View style={styles.audioContainer}>
            <TouchableOpacity onPress={playAudio} style={styles.playButton}>
              <Ionicons name="volume-high" size={80} color="#4ECDC4" />
            </TouchableOpacity>
            <Text style={styles.audioText}>Tap to replay audio</Text>
          </View>
        );
      case "shuffle":
        if (currentQuestion.media) {
          return (
            <Image
              source={{ uri: currentQuestion.media }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleRetry = async () => {
    await Speech.stop();
    router.back();
  };

  const handleExit = async () => {
    await Speech.stop();
    router.push("/");
  };

  if (showResult) {
    const percentage = ((score / quiz.questions.length) * 100).toFixed(0);
    const timeTaken = quizEndTime - quizStartTime;
    const wrongAnswers = quiz.questions.length - score;

    return (
      <ScreenWrapper>
        <ScrollView style={styles.resultScrollView}>
          <View style={styles.resultHeader}>
            <Ionicons
              name={percentage >= 70 ? "trophy" : "ribbon"}
              size={100}
              color={percentage >= 70 ? "#FFD700" : "#C0C0C0"}
            />
            <Text style={styles.resultTitle}>Quiz Complete!</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
              <Text style={styles.statNumber}>{score}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={40} color="#FF6B6B" />
              <Text style={styles.statNumber}>{wrongAnswers}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="star" size={40} color="#FFD700" />
              <Text style={styles.statNumber}>{percentage}%</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>

          {quiz.timerEnabled && (
            <View style={styles.timeCard}>
              <Ionicons name="time" size={30} color="#4A90E2" />
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Time Taken</Text>
                <Text style={styles.timeValue}>{formatTime(timeTaken)}</Text>
              </View>
            </View>
          )}

          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Answer Review</Text>
            {answers.map((answer, index) => (
              <View key={index} style={styles.answerReview}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.questionNumberReview}>
                    Question {index + 1}
                  </Text>
                  <Ionicons
                    name={
                      answer.isCorrect ? "checkmark-circle" : "close-circle"
                    }
                    size={24}
                    color={answer.isCorrect ? "#4CAF50" : "#FF6B6B"}
                  />
                </View>
                <Text style={styles.reviewQuestion}>{answer.question}</Text>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Your answer:</Text>
                  <Text
                    style={[
                      styles.answerValue,
                      answer.isCorrect
                        ? styles.correctAnswerValue
                        : styles.wrongAnswerValue,
                    ]}
                  >
                    {answer.selectedAnswer}
                  </Text>
                </View>
                {!answer.isCorrect && (
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Correct answer:</Text>
                    <Text
                      style={[styles.answerValue, styles.correctAnswerValue]}
                    >
                      {answer.correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={24} color="#FFF" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
              <Ionicons name="home" size={24} color="#FFF" />
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#FFF">
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
        </View>
        {quiz.timerEnabled && (
          <View style={styles.timerContainer}>
            <Ionicons
              name="time"
              size={20}
              color={timeLeft <= 5 ? "#FF6B6B" : "#4A90E2"}
            />
            <Text
              style={[styles.timerText, timeLeft <= 5 && styles.timerWarning]}
            >
              {timeLeft}s
            </Text>
          </View>
        )}
      </View>
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        {renderQuestionContent()}

        {quiz.type !== "audio" && (
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        )}

        <View style={styles.answersContainer}>
          {shuffledAnswers.map((answer, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerButton,
                selectedAnswer?.text === answer.text &&
                  styles.selectedAnswerButton,
              ]}
              onPress={() => handleAnswerSelect(answer)}
              disabled={selectedAnswer !== null}
            >
              <Text
                style={[
                  styles.answerText,
                  selectedAnswer?.text === answer.text &&
                    styles.selectedAnswerButtonText,
                ]}
              >
                {answer.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerLeft: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
    color: "#4A90E2",
  },
  timerWarning: {
    color: "#FF6B6B",
  },
  questionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  questionImage: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginBottom: 30,
    backgroundColor: "#FFF",
  },
  audioContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FFFF",
    padding: 50,
    borderRadius: 15,
    marginBottom: 30,
  },
  playButton: {
    padding: 20,
  },
  audioText: {
    fontSize: 18,
    color: "#4ECDC4",
    marginTop: 15,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  answersContainer: {
    gap: 15,
  },
  answerButton: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedAnswerButton: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  answerText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  selectedAnswerButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  resultScrollView: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  resultHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#FFF",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  timeInfo: {
    marginLeft: 15,
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  reviewSection: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  answerReview: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  questionNumberReview: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  reviewQuestion: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    fontWeight: "500",
  },
  answerRow: {
    marginTop: 5,
  },
  answerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  answerValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  correctAnswerValue: {
    color: "#4CAF50",
  },
  wrongAnswerValue: {
    color: "#FF6B6B",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 30,
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4ECDC4",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  exitButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4A90E2",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
