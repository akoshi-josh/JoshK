import AsyncStorage from "@react-native-async-storage/async-storage";

const QUIZ_HISTORY_KEY = "@quiz_history";
const PROFILE_STATS_KEY = "@profile_stats";

export const saveQuizResult = async (quizResult) => {
  try {
    const existingHistory = await getQuizHistory();
    const newHistory = [quizResult, ...existingHistory];
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
