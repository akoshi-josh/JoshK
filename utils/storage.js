import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system/next";

const QUIZ_HISTORY_KEY = "@quiz_history";
const PROFILE_STATS_KEY = "@profile_stats";

// Helper function to clean up old images
export const deleteImageFile = async (imageUri) => {
  try {
    if (imageUri && imageUri.includes("file://")) {
      const file = new File(imageUri);
      // Check if file exists before deleting
      try {
        await file.delete();
      } catch (deleteError) {
        // File might not exist or already deleted, which is fine
        console.log("File already deleted or doesn't exist:", imageUri);
      }
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

export const saveQuizResult = async (quizResult) => {
  try {
    const existingHistory = await getQuizHistory();

    // Find if a quiz with the same title already exists
    const existingQuizIndex = existingHistory.findIndex(
      (quiz) => quiz.title === quizResult.title,
    );

    let newHistory;
    if (existingQuizIndex !== -1) {
      // Delete old images if they're being replaced
      const oldQuiz = existingHistory[existingQuizIndex];
      if (oldQuiz.questions) {
        for (const question of oldQuiz.questions) {
          if (question.media) {
            const newQuestion = quizResult.questions.find(
              (q) => q.id === question.id,
            );
            if (!newQuestion || question.media !== newQuestion.media) {
              await deleteImageFile(question.media);
            }
          }
        }
      }

      // Update existing quiz instead of adding new one
      newHistory = [...existingHistory];
      newHistory[existingQuizIndex] = {
        ...quizResult,
        id: existingHistory[existingQuizIndex].id, // Keep the same ID
        firstAttemptDate:
          existingHistory[existingQuizIndex].firstAttemptDate ||
          existingHistory[existingQuizIndex].date,
        date: new Date().toISOString(), // Update to latest attempt date
        attempts: (existingHistory[existingQuizIndex].attempts || 1) + 1,
      };
    } else {
      // Add new quiz to history
      newHistory = [
        {
          ...quizResult,
          firstAttemptDate: quizResult.date,
          attempts: 1,
        },
        ...existingHistory,
      ];
    }

    await AsyncStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(newHistory));

    await updateProfileStats(quizResult);

    return true;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return false;
  }
};

export const getQuizHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(QUIZ_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error getting quiz history:", error);
    return [];
  }
};

export const deleteQuizHistory = async (quizId) => {
  try {
    const existingHistory = await getQuizHistory();
    const quizToDelete = existingHistory.find((quiz) => quiz.id === quizId);

    // Delete associated images
    if (quizToDelete && quizToDelete.questions) {
      for (const question of quizToDelete.questions) {
        if (question.media) {
          await deleteImageFile(question.media);
        }
      }
    }

    const newHistory = existingHistory.filter((quiz) => quiz.id !== quizId);
    await AsyncStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(newHistory));
    return true;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return false;
  }
};

export const clearAllHistory = async () => {
  try {
    // Delete all images before clearing history
    const existingHistory = await getQuizHistory();
    for (const quiz of existingHistory) {
      if (quiz.questions) {
        for (const question of quiz.questions) {
          if (question.media) {
            await deleteImageFile(question.media);
          }
        }
      }
    }

    await AsyncStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error("Error clearing history:", error);
    return false;
  }
};

export const updateProfileStats = async (quizResult) => {
  try {
    const stats = await getProfileStats();

    const newStats = {
      totalQuizzes: stats.totalQuizzes + 1,
      totalQuestions: stats.totalQuestions + quizResult.totalQuestions,
      correctAnswers: stats.correctAnswers + quizResult.score,
      wrongAnswers:
        stats.wrongAnswers + (quizResult.totalQuestions - quizResult.score),
      totalTimeSpent: stats.totalTimeSpent + quizResult.timeTaken,
      averageScore: 0,
    };

    newStats.averageScore = (
      (newStats.correctAnswers / newStats.totalQuestions) *
      100
    ).toFixed(1);

    await AsyncStorage.setItem(PROFILE_STATS_KEY, JSON.stringify(newStats));
    return newStats;
  } catch (error) {
    console.error("Error updating profile stats:", error);
    return null;
  }
};

export const getProfileStats = async () => {
  try {
    const stats = await AsyncStorage.getItem(PROFILE_STATS_KEY);
    return stats
      ? JSON.parse(stats)
      : {
          totalQuizzes: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          totalTimeSpent: 0,
          averageScore: 0,
        };
  } catch (error) {
    console.error("Error getting profile stats:", error);
    return {
      totalQuizzes: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalTimeSpent: 0,
      averageScore: 0,
    };
  }
};

export const resetProfileStats = async () => {
  try {
    const initialStats = {
      totalQuizzes: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalTimeSpent: 0,
      averageScore: 0,
    };
    await AsyncStorage.setItem(PROFILE_STATS_KEY, JSON.stringify(initialStats));
    return true;
  } catch (error) {
    console.error("Error resetting stats:", error);
    return false;
  }
};
