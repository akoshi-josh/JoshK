import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const quizTypes = [
    { id: "images", name: "Images", icon: "image", color: "#FF6B6B" },
    { id: "audio", name: "Audio", icon: "volume-high", color: "#4ECDC4" },
    { id: "text", name: "Text", icon: "text", color: "#95E1D3" },
    { id: "numbers", name: "Numbers", icon: "calculator", color: "#9B59B6" },
    { id: "grammar", name: "Grammar", icon: "book", color: "#E67E22" },
    { id: "shuffle", name: "Shuffle", icon: "shuffle", color: "#F38181" },
  ];

  const handleQuizTypeSelect = (type) => {
    setShowModal(false);
    router.push(`/create-quiz?type=${type}`);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Learn Korean</Text>
        <Text style={styles.subtitle}>Start your quiz journey!</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.buttonText}>Start New Quiz</Text>
        </TouchableOpacity>

        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Quiz Type</Text>

              <View style={styles.quizTypeGrid}>
                {quizTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.quizTypeButton,
                      { backgroundColor: type.color },
                    ]}
                    onPress={() => handleQuizTypeSelect(type.id)}
                  >
                    <Ionicons name={type.icon} size={32} color="#FFF" />
                    <Text style={styles.quizTypeText}>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
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
    padding: 25,
    width: "90%",
    maxWidth: 450,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  quizTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quizTypeButton: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quizTypeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#666",
    fontSize: 16,
  },
});
