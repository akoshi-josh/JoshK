import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/id.png")}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.name}>Josh Ralph Singson</Text>
        <Text style={styles.role}>Mobile App Developer</Text>
        <View style={styles.ageBadge}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.ageText}>22 years old</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={24} color="#4A90E2" />
          <Text style={styles.sectionTitle}>About Me</Text>
        </View>
        <Text style={styles.description}>
          I'm a passionate 4th-year Infromation tekonologia student on the verge
          of graduation, specializing in mobile application development. I love
          creating innovative solutions that make a real impact on people's
          lives.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="school" size={24} color="#4ECDC4" />
          <Text style={styles.sectionTitle}>Education</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Bachelor of Science in Computer Science
          </Text>
          <Text style={styles.infoSubtitle}>4th Year - Graduating Student</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.statusText}>Final Year</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="code-slash" size={24} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Recent Projects</Text>
        </View>

        <View style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Ionicons name="hand-left" size={30} color="#9B59B6" />
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>Sign Language Translator</Text>
              <Text style={styles.projectSubtitle}>Mobile Application</Text>
            </View>
          </View>
          <Text style={styles.projectDescription}>
            Developed an innovative mobile app that translates sign language
            gestures into text and speech in real-time using machine learning
            and computer vision. This app helps bridge communication gaps for
            the deaf and hard-of-hearing community.
          </Text>
          <View style={styles.techStack}>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>React Native</Text>
            </View>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>TensorFlow</Text>
            </View>
            <View style={styles.techBadge}>
              <Text style={styles.techText}>ML</Text>
            </View>
          </View>
        </View>

        <View style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Ionicons name="book" size={30} color="#4A90E2" />
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>
                JoshK - Korean Flashcard App
              </Text>
              <Text style={styles.projectSubtitle}>Educational Mobile App</Text>
            </View>
          </View>
          <Text style={styles.projectDescription}>
            An interactive Korean language learning application featuring
            multiple quiz modes (images, audio, text, shuffle) with timer
            functionality and progress tracking. Designed to make learning
            Korean engaging and effective.
          </Text>
          <View style={styles.devDuration}>
            <Ionicons name="time" size={18} color="#4A90E2" />
            <Text style={styles.durationText}>Development Time: 8 hours</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={styles.sectionTitle}>Technical Skills</Text>
        </View>
        <View style={styles.skillsGrid}>
          <View style={styles.skillCard}>
            <Ionicons name="phone-portrait" size={28} color="#4A90E2" />
            <Text style={styles.skillText}>Mobile Development</Text>
          </View>
          <View style={styles.skillCard}>
            <Ionicons name="logo-react" size={28} color="#61DAFB" />
            <Text style={styles.skillText}>React Native</Text>
          </View>
          <View style={styles.skillCard}>
            <Ionicons name="logo-javascript" size={28} color="#F7DF1E" />
            <Text style={styles.skillText}>JavaScript</Text>
          </View>
          <View style={styles.skillCard}>
            <Ionicons name="git-branch" size={28} color="#F05032" />
            <Text style={styles.skillText}>Git & GitHub</Text>
          </View>
          <View style={styles.skillCard}>
            <Ionicons name="server" size={28} color="#68A063" />
            <Text style={styles.skillText}>Node.js</Text>
          </View>
          <View style={styles.skillCard}>
            <Ionicons name="flask" size={28} color="#9B59B6" />
            <Text style={styles.skillText}>Machine Learning</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="mail" size={24} color="#95E1D3" />
          <Text style={styles.sectionTitle}>Get In Touch</Text>
        </View>
        <Text style={styles.contactDescription}>
          I'm always open to discussing new projects, creative ideas, or
          opportunities to be part of your vision. Feel free to reach out!
        </Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>Email Me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="logo-github" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>GitHub</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ by Josh Ralph Singson
        </Text>
        <Text style={styles.footerSubtext}>© 2024 - All Rights Reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: "#4A90E2",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#F0F8FF",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  role: {
    fontSize: 18,
    color: "#F0F8FF",
    marginBottom: 12,
  },
  ageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  ageText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  statusText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "600",
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 15,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  projectSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  projectDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 15,
  },
  techStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  techBadge: {
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  techText: {
    color: "#4A90E2",
    fontSize: 12,
    fontWeight: "600",
  },
  devDuration: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    gap: 8,
  },
  durationText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  skillCard: {
    width: "30%",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  skillText: {
    fontSize: 12,
    color: "#333",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  contactDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contactButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#999",
  },
});
