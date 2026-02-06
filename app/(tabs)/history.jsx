import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import {
    clearAllHistory,
    deleteQuizHistory,
    getProfileStats,
    getQuizHistory,
} from "../../utils/storage";

export default function History() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeSpent: 0,
    averageScore: 0,
  });
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      loadStats();
    }, []),
  );

  const loadHistory = async () => {
    const data = await getQuizHistory();
    setHistory(data);
  };

  const loadStats = async () => {
    const data = await getProfileStats();
    setStats(data);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleRetakeQuiz = (quiz) => {
    const quizData = {
      type: quiz.type,
      questions: quiz.questions,
      timerEnabled: quiz.timerEnabled,
      timerDuration: 30,
    };

    router.push({
      pathname: "/take-quiz",
      params: {
        quizData: JSON.stringify(quizData),
      },
    });
  };

  const handleDeleteQuiz = (quizId) => {
    Alert.alert(
      "Delete Quiz",
      "Are you sure you want to delete this quiz from history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteQuizHistory(quizId);
            loadHistory();
            loadStats();
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to clear all quiz history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearAllHistory();
            loadHistory();
            loadStats();
          },
        },
      ],
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "images":
        return "image";
      case "audio":
        return "volume-high";
      case "text":
        return "text";
      case "shuffle":
        return "shuffle";
      default:
        return "help-circle";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "images":
        return "#FF6B6B";
      case "audio":
        return "#4ECDC4";
      case "text":
        return "#95E1D3";
      case "shuffle":
        return "#F38181";
      default:
        return "#999";
    }
  };

  const renderQuizItem = ({ item }) => (
    <View style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(item.type) },
          ]}
        >
          <Ionicons name={getTypeIcon(item.type)} size={20} color="#FFF" />
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteQuiz(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>{formatDate(item.date)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.statText}>
            {item.score}/{item.totalQuestions}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.statText}>{item.percentage}%</Text>
        </View>

        {item.timerEnabled && (
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color="#4A90E2" />
            <Text style={styles.statText}>{formatTime(item.timeTaken)}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.retakeButton}
        onPress={() => handleRetakeQuiz(item)}
      >
        <Ionicons name="refresh" size={20} color="#4A90E2" />
        <Text style={styles.retakeButtonText}>Retake Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="book" size={28} color="#4A90E2" />
              <Text style={styles.statNumber}>{stats.totalQuizzes}</Text>
              <Text style={styles.statLabel}>Total Quizzes</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="help-circle" size={28} color="#95E1D3" />
              <Text style={styles.statNumber}>{stats.totalQuestions}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={28} color="#FF6B6B" />
              <Text style={styles.statNumber}>{stats.wrongAnswers}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailCard}>
              <Ionicons name="trending-up" size={24} color="#FFD700" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Average Score</Text>
                <Text style={styles.detailValue}>{stats.averageScore}%</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Ionicons name="time" size={24} color="#4ECDC4" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Time Spent</Text>
                <Text style={styles.detailValue}>
                  {formatTotalTime(stats.totalTimeSpent)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Quiz History</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No quizzes completed yet</Text>
              <Text style={styles.emptySubtext}>
                Start a quiz to see your history here
              </Text>
            </View>
          ) : (
            <View>
              {history.map((item) => (
                <View key={item.id}>{renderQuizItem({ item })}</View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: "#FFF",
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  clearButton: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 15,
    fontWeight: "600",
  },
  emptySubtext: {
    textAlign: "center",
    color: "#BBB",
    fontSize: 14,
    marginTop: 8,
  },
  quizCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 5,
  },
  retakeButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
  },
});
