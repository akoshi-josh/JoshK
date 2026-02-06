import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";

export default function CreateQuiz() {
  const { type } = useLocalSearchParams();
  const router = useRouter();

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "",
      correctAnswer: "",
      wrongAnswers: ["", "", ""],
      media: null,
    },
  ]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState("30");
  const [showStartModal, setShowStartModal] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: "",
      correctAnswer: "",
      wrongAnswers: ["", "", ""],
      media: null,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const updateWrongAnswer = (id, index, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const newWrongAnswers = [...q.wrongAnswers];
          newWrongAnswers[index] = value;
          return { ...q, wrongAnswers: newWrongAnswers };
        }
        return q;
      }),
    );
  };

  const pickImage = async (questionId) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      updateQuestion(questionId, "media", result.assets[0].uri);
    }
  };

  const testAudioQuestion = async (questionId) => {
    const question = questions.find((q) => q.id === questionId);

    if (!question.question.trim()) {
      Alert.alert(
        "No Text",
        "Please enter a question first to test the audio.",
      );
      return;
    }

    await Speech.stop();

    Speech.speak(question.question, {
      language: "ko-KR",
      pitch: 1.0,
      rate: 0.75,
    });
  };

  const handleFinishAndStart = () => {
    if (!quizTitle.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your quiz");
      return;
    }

    const isValid = questions.every(
      (q) =>
        q.question.trim() !== "" &&
        q.correctAnswer.trim() !== "" &&
        q.wrongAnswers.every((wa) => wa.trim() !== ""),
    );

    if (!isValid) {
      Alert.alert(
        "Incomplete Questions",
        "Please fill in all questions and answers",
      );
      return;
    }

    setShowStartModal(true);
  };

  const startTest = async () => {
    await Speech.stop();

    setShowStartModal(false);
    router.push({
      pathname: "/take-quiz",
      params: {
        quizData: JSON.stringify({
          title: quizTitle,
          type,
          questions,
          timerEnabled,
          timerDuration: parseInt(timerDuration),
        }),
      },
    });
  };

  const getMediaInputComponent = (question) => {
    switch (type) {
      case "images":
        return (
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => pickImage(question.id)}
          >
            <Ionicons name="image" size={24} color="#4A90E2" />
            <Text style={styles.mediaButtonText}>
              {question.media ? "Change Image" : "Select Image"}
            </Text>
          </TouchableOpacity>
        );
      case "audio":
        return (
          <View>
            <View style={styles.audioInfo}>
              <Ionicons name="information-circle" size={20} color="#4ECDC4" />
              <Text style={styles.audioInfoText}>
                The question text will be converted to speech
              </Text>
            </View>
            <TouchableOpacity
              style={styles.testAudioButton}
              onPress={() => testAudioQuestion(question.id)}
            >
              <Ionicons name="play-circle" size={24} color="#4ECDC4" />
              <Text style={styles.testAudioButtonText}>Test Audio</Text>
            </TouchableOpacity>
          </View>
        );
      case "shuffle":
        return (
          <View style={styles.shuffleOptions}>
            <TouchableOpacity
              style={styles.shuffleButton}
              onPress={() => pickImage(question.id)}
            >
              <Ionicons name="image" size={20} color="#4A90E2" />
              <Text style={styles.shuffleButtonText}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shuffleButton}
              onPress={() => testAudioQuestion(question.id)}
            >
              <Ionicons name="musical-notes" size={20} color="#4A90E2" />
              <Text style={styles.shuffleButtonText}>Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shuffleButton}>
              <Ionicons name="text" size={20} color="#4A90E2" />
              <Text style={styles.shuffleButtonText}>Text</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Create {type?.charAt(0).toUpperCase() + type?.slice(1)} Quiz
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.titleSection}>
            <Text style={styles.titleLabel}>Quiz Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter quiz title (e.g., Korean Colors, Basic Greetings)"
              value={quizTitle}
              onChangeText={setQuizTitle}
              placeholderTextColor="#302f2f"
            />
          </View>

          {questions.map((question, qIndex) => (
            <View key={question.id} style={styles.questionCard}>
              <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>

              {getMediaInputComponent(question)}

              <TextInput
                style={styles.input}
                placeholder={
                  type === "audio"
                    ? "Enter question (will be spoken)"
                    : "Enter question"
                }
                placeholderTextColor={"grey"}
                value={question.question}
                onChangeText={(text) =>
                  updateQuestion(question.id, "question", text)
                }
                multiline
              />

              <Text style={styles.label}>Correct Answer</Text>
              <TextInput
                style={[styles.input, styles.correctInput]}
                placeholder="Enter correct answer"
                placeholderTextColor={"grey"}
                value={question.correctAnswer}
                onChangeText={(text) =>
                  updateQuestion(question.id, "correctAnswer", text)
                }
              />

              <Text style={styles.label}>Wrong Answers</Text>
              {question.wrongAnswers.map((wa, index) => (
                <TextInput
                  key={index}
                  style={[styles.input, styles.wrongInput]}
                  placeholder={`Wrong answer ${index + 1}`}
                  placeholderTextColor={"grey"}
                  value={wa}
                  onChangeText={(text) =>
                    updateWrongAnswer(question.id, index, text)
                  }
                />
              ))}
            </View>
          ))}

          <View style={styles.bottomControls}>
            <View style={styles.timerControl}>
              <Text style={styles.timerLabel}>Timer</Text>
              <Switch
                value={timerEnabled}
                onValueChange={setTimerEnabled}
                trackColor={{ false: "#767577", true: "#4A90E2" }}
                thumbColor={timerEnabled ? "#FFF" : "#f4f3f4"}
              />
              {timerEnabled && (
                <TextInput
                  style={styles.timerInput}
                  placeholder="Seconds"
                  keyboardType="numeric"
                  value={timerDuration}
                  onChangeText={setTimerDuration}
                />
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.addButton} onPress={addQuestion}>
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>Add Question</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinishAndStart}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.finishButtonText}>Finish & Start Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showStartModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStartModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons name="rocket" size={60} color="#4A90E2" />
              <Text style={styles.modalTitle}>Ready to Start?</Text>
              <Text style={styles.modalQuizTitle}>"{quizTitle}"</Text>
              <Text style={styles.modalSubtitle}>
                You have {questions.length} question
                {questions.length > 1 ? "s" : ""}
              </Text>
              {timerEnabled && (
                <Text style={styles.modalSubtitle}>
                  Timer: {timerDuration} seconds per question
                </Text>
              )}

              <TouchableOpacity
                style={styles.startTestButton}
                onPress={startTest}
              >
                <Text style={styles.startTestButtonText}>Start Test</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStartModal(false)}
              >
                <Text style={styles.cancelButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  titleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 10,
  },
  titleInput: {
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    fontWeight: "600",
    backgroundColor: "#F0F8FF",
    color: "#333",
  },
  questionCard: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 15,
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderStyle: "dashed",
  },
  mediaButtonText: {
    marginLeft: 10,
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "500",
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  audioInfoText: {
    flex: 1,
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "500",
  },
  testAudioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    gap: 8,
  },
  testAudioButtonText: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
  shuffleOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  shuffleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  shuffleButtonText: {
    marginLeft: 5,
    color: "#4A90E2",
    fontSize: 12,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    marginTop: 5,
  },
  correctInput: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8F4",
    color: "black",
  },
  wrongInput: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  bottomControls: {
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  timerControl: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  timerInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: "center",
    marginLeft: 10,
  },
  actionButtons: {
    gap: 12,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#4ECDC4",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  finishButton: {
    flexDirection: "row",
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  finishButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 30,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  modalQuizTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
    textAlign: "center",
  },
  startTestButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 25,
    width: "100%",
  },
  startTestButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
});
