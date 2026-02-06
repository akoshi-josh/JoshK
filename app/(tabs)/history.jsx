import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      title: quiz.title || "Untitled Quiz",
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
          <Ionicons name={getTypeIcon(item.type)} size={18} color="#FFF" />
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteQuiz(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {item.title && (
        <Text style={styles.quizTitle} numberOfLines={2}>
          {item.title}
        </Text>
      )}

      <Text style={styles.dateText}>{formatDate(item.date)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.statText}>
            {item.score}/{item.totalQuestions}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="star" size={18} color="#FFD700" />
          <Text style={styles.statText}>{item.percentage}%</Text>
        </View>

        {item.timerEnabled && (
          <View style={styles.statItem}>
            <Ionicons name="time" size={18} color="#4A90E2" />
            <Text style={styles.statText}>{formatTime(item.timeTaken)}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.retakeButton}
        onPress={() => handleRetakeQuiz(item)}
      >
        <Ionicons name="refresh" size={18} color="#4A90E2" />
        <Text style={styles.retakeButtonText}>Retake Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/mainbg.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="book" size={24} color="#4A90E2" />
              <Text style={styles.statNumber}>{stats.totalQuizzes}</Text>
              <Text style={styles.statLabel}>Quizzes</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="help-circle" size={24} color="#95E1D3" />
              <Text style={styles.statNumber}>{stats.totalQuestions}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>{stats.wrongAnswers}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailCard}>
              <Ionicons name="trending-up" size={22} color="#FFD700" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Avg Score</Text>
                <Text style={styles.detailValue}>{stats.averageScore}%</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Ionicons name="time" size={22} color="#4ECDC4" />
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
              <View style={styles.emptyIconContainer}>
                <Ionicons name="clipboard-outline" size={50} color="#CCC" />
              </View>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 10,
  },
  detailCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  historySection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clearButton: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
  },
  emptyIconContainer: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: "center",
    color: "#BBB",
    fontSize: 13,
  },
  quizCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  typeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  quizTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  retakeButtonText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
});
