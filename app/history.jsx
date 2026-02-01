import { StyleSheet, Text, View } from "react-native";

export default function History() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz History</Text>
      <Text style={styles.emptyText}>No quizzes completed yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 50,
  },
});
