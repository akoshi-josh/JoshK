import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system/next";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
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

// Korean number systems
const SINO_KOREAN = {
  0: "영",
  1: "일",
  2: "이",
  3: "삼",
  4: "사",
  5: "오",
  6: "육",
  7: "칠",
  8: "팔",
  9: "구",
  10: "십",
  100: "백",
  1000: "천",
  10000: "만",
};

const NATIVE_KOREAN = {
  1: "하나",
  2: "둘",
  3: "셋",
  4: "넷",
  5: "다섯",
  6: "여섯",
  7: "일곱",
  8: "여덟",
  9: "아홉",
  10: "열",
  20: "스물",
  30: "서른",
  40: "마흔",
  50: "쉰",
  60: "예순",
  70: "일흔",
  80: "여든",
  90: "아흔",
};

export default function CreateQuiz() {
  const { type, editMode, quizData: quizDataParam } = useLocalSearchParams();
  const router = useRouter();
  const isEditMode = editMode === "true";
  const isNumbersQuiz = type === "numbers";
  const isShuffleQuiz = type === "shuffle";

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState("30");
  const [showStartModal, setShowStartModal] = useState(false);
  const [editQuizId, setEditQuizId] = useState(null);

  // Numbers quiz settings
  const [showNumbersSetup, setShowNumbersSetup] = useState(
    isNumbersQuiz && !isEditMode,
  );
  const [numberSystem, setNumberSystem] = useState("sino");
  const [digitRange, setDigitRange] = useState("1-10");
  const [quizItemCount, setQuizItemCount] = useState("10");

  // Shuffle quiz settings
  const [showShuffleModal, setShowShuffleModal] = useState(
    isShuffleQuiz && !isEditMode,
  );
  const [showShuffleNumbersSetup, setShowShuffleNumbersSetup] = useState(false);

  useEffect(() => {
    if (isEditMode && quizDataParam) {
      try {
        const parsedData = JSON.parse(quizDataParam);
        setQuizTitle(parsedData.title || "");
        setQuestions(parsedData.questions || []);
        setTimerEnabled(parsedData.timerEnabled || false);
        setTimerDuration(String(parsedData.timerDuration || 30));
        setEditQuizId(parsedData.id || null);
      } catch (error) {
        console.error("Error parsing quiz data:", error);
        Alert.alert("Error", "Failed to load quiz data");
      }
    }
  }, [isEditMode, quizDataParam]);

  // Generate Sino-Korean number in Hangul (supports up to 100 million)
  const generateSinoKorean = (num) => {
    if (num === 0) return SINO_KOREAN[0];
    if (num < 10) return SINO_KOREAN[num];

    let result = "";

    const manCheonman = Math.floor(num / 10000);
    const remainder = num % 10000;

    if (manCheonman > 0) {
      if (manCheonman >= 1000) {
        const cheon = Math.floor(manCheonman / 1000);
        if (cheon > 1) result += SINO_KOREAN[cheon];
        result += SINO_KOREAN[1000];
        const manRemainder = manCheonman % 1000;

        if (manRemainder >= 100) {
          const baek = Math.floor(manRemainder / 100);
          if (baek > 1) result += SINO_KOREAN[baek];
          result += SINO_KOREAN[100];
        }

        const manTens = manRemainder % 100;
        if (manTens >= 10) {
          const sip = Math.floor(manTens / 10);
          if (sip > 1) result += SINO_KOREAN[sip];
          result += SINO_KOREAN[10];
        }

        const manOnes = manTens % 10;
        if (manOnes > 0) result += SINO_KOREAN[manOnes];
      } else if (manCheonman >= 100) {
        const baek = Math.floor(manCheonman / 100);
        if (baek > 1) result += SINO_KOREAN[baek];
        result += SINO_KOREAN[100];

        const manTens = manCheonman % 100;
        if (manTens >= 10) {
          const sip = Math.floor(manTens / 10);
          if (sip > 1) result += SINO_KOREAN[sip];
          result += SINO_KOREAN[10];
        }

        const manOnes = manTens % 10;
        if (manOnes > 0) result += SINO_KOREAN[manOnes];
      } else if (manCheonman >= 10) {
        const sip = Math.floor(manCheonman / 10);
        if (sip > 1) result += SINO_KOREAN[sip];
        result += SINO_KOREAN[10];

        const manOnes = manCheonman % 10;
        if (manOnes > 0) result += SINO_KOREAN[manOnes];
      } else {
        if (manCheonman > 1) result += SINO_KOREAN[manCheonman];
      }

      result += SINO_KOREAN[10000];
    }

    if (remainder >= 1000) {
      const cheon = Math.floor(remainder / 1000);
      if (cheon > 1) result += SINO_KOREAN[cheon];
      result += SINO_KOREAN[1000];
    }

    const hundreds = Math.floor((remainder % 1000) / 100);
    if (hundreds > 0) {
      if (hundreds > 1) result += SINO_KOREAN[hundreds];
      result += SINO_KOREAN[100];
    }

    const tens = Math.floor((remainder % 100) / 10);
    if (tens > 0) {
      if (tens > 1) result += SINO_KOREAN[tens];
      result += SINO_KOREAN[10];
    }

    const ones = remainder % 10;
    if (ones > 0) {
      result += SINO_KOREAN[ones];
    }

    return result;
  };

  // Generate Native Korean number in Hangul (up to 99)
  const generateNativeKorean = (num) => {
    if (num === 0) return "";
    if (num <= 10) return NATIVE_KOREAN[num] || "";
    if (num > 99) return "";

    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;

    let result = NATIVE_KOREAN[tens] || "";
    if (ones > 0) {
      result += " " + NATIVE_KOREAN[ones];
    }

    return result;
  };

  // Generate wrong answers
  const generateWrongAnswers = (correctNum, min, max, isSino) => {
    const wrongNums = new Set();
    const generateFunc = isSino ? generateSinoKorean : generateNativeKorean;
    const correctAnswer = generateFunc(correctNum);

    let attempts = 0;
    const maxAttempts = 100;

    while (wrongNums.size < 3 && attempts < maxAttempts) {
      attempts++;
      let wrongNum;
      const variation = Math.random();

      if (variation < 0.3) {
        wrongNum = correctNum + (Math.random() < 0.5 ? -1 : 1);
      } else if (variation < 0.5) {
        wrongNum = correctNum + (Math.random() < 0.5 ? -10 : 10);
      } else if (variation < 0.7) {
        wrongNum = correctNum + (Math.random() < 0.5 ? -100 : 100);
      } else {
        const range = Math.min(1000, Math.floor(max / 10));
        wrongNum = correctNum + Math.floor(Math.random() * range * 2) - range;
      }

      if (wrongNum >= min && wrongNum <= max && wrongNum !== correctNum) {
        const wrongAnswer = generateFunc(wrongNum);
        if (
          wrongAnswer &&
          wrongAnswer !== correctAnswer &&
          !wrongNums.has(wrongAnswer)
        ) {
          wrongNums.add(wrongAnswer);
        }
      }
    }

    while (wrongNums.size < 3) {
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      if (randomNum !== correctNum) {
        const wrongAnswer = generateFunc(randomNum);
        if (
          wrongAnswer &&
          wrongAnswer !== correctAnswer &&
          !wrongNums.has(wrongAnswer)
        ) {
          wrongNums.add(wrongAnswer);
        }
      }
    }

    return Array.from(wrongNums).slice(0, 3);
  };

  // Generate numbers quiz
  const handleGenerateNumbersQuiz = () => {
    const [minStr, maxStr] = digitRange.split("-");
    const min = parseInt(minStr);
    const max = parseInt(maxStr);
    const count = parseInt(quizItemCount);

    const isSino = numberSystem === "sino";
    const effectiveMax = isSino ? max : Math.min(max, 99);

    const generatedQuestions = [];
    const usedNumbers = new Set();

    for (let i = 0; i < count; i++) {
      let randomNum;
      let attempts = 0;
      do {
        randomNum = Math.floor(Math.random() * (effectiveMax - min + 1)) + min;
        attempts++;
      } while (usedNumbers.has(randomNum) && attempts < 1000);

      usedNumbers.add(randomNum);

      const correctAnswer = isSino
        ? generateSinoKorean(randomNum)
        : generateNativeKorean(randomNum);

      const wrongAnswers = generateWrongAnswers(
        randomNum,
        min,
        effectiveMax,
        isSino,
      );

      const questionFormat = Math.random() < 0.5 ? "Korean" : "Hangul";

      generatedQuestions.push({
        id: Date.now() + i,
        question: `What is "${randomNum}" in ${questionFormat}?`,
        correctAnswer: correctAnswer,
        wrongAnswers: wrongAnswers,
        media: null,
        contentType: "numbers",
      });
    }

    setQuestions([...questions, ...generatedQuestions]);
    setShowNumbersSetup(false);
    setShowShuffleNumbersSetup(false);
    Alert.alert("Success", `Generated ${count} number questions!`);
  };

  // Handle shuffle category - add question with type selection
  const handleShuffleAddQuestion = (contentType) => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      correctAnswer: "",
      wrongAnswers: ["", "", ""],
      media: null,
      contentType: contentType,
    };
    setQuestions([...questions, newQuestion]);
    setShowShuffleModal(false);
  };

  // Handle shuffle numbers generation
  const handleShuffleNumbersGeneration = () => {
    setShowShuffleModal(false);
    setShowShuffleNumbersSetup(true);
  };

  const addQuestion = () => {
    if (isShuffleQuiz) {
      setShowShuffleModal(true);
    } else {
      const newQuestion = {
        id: Date.now(),
        question: "",
        correctAnswer: "",
        wrongAnswers: ["", "", ""],
        media: null,
      };
      setQuestions([...questions, newQuestion]);
    }
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
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        const filename = `quiz_img_${questionId}_${Date.now()}.jpg`;
        const destinationFile = new File(Paths.document, filename);
        const sourceFile = new File(selectedUri);
        await sourceFile.copy(destinationFile);
        updateQuestion(questionId, "media", destinationFile.uri);
        Alert.alert("Success", "Image saved to app storage!");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to save image. Please try again.");
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

    if (questions.length === 0) {
      Alert.alert("No Questions", "Please add at least one question");
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
    // For shuffle quiz, check the contentType
    if (isShuffleQuiz && question.contentType) {
      if (question.contentType === "images") {
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
      } else if (question.contentType === "audio") {
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
      }
      return null; // text type and numbers type have no media
    }

    // Regular quiz types
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
      default:
        return null;
    }
  };

  const isQuestionEditable = (question) => {
    // Generated number questions shouldn't be editable
    if (
      question.contentType === "numbers" &&
      question.question.includes("What is")
    ) {
      return false;
    }
    return true;
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode
              ? "Edit Quiz"
              : `Create ${type?.charAt(0).toUpperCase() + type?.slice(1)} Quiz`}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.titleSection}>
            <Text style={styles.titleLabel}>Quiz Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter quiz title (e.g., Korean Numbers 1-100)"
              value={quizTitle}
              onChangeText={setQuizTitle}
              placeholderTextColor="#8f8f8f"
            />
          </View>

          {/* Numbers Quiz Setup */}
          {isNumbersQuiz && !isEditMode && showNumbersSetup && (
            <View style={styles.numbersSetupSection}>
              <Text style={styles.setupTitle}>Numbers Quiz Settings</Text>

              <Text style={styles.setupLabel}>Korean Number System</Text>
              <View style={styles.systemButtons}>
                <TouchableOpacity
                  style={[
                    styles.systemButton,
                    numberSystem === "sino" && styles.systemButtonActive,
                  ]}
                  onPress={() => setNumberSystem("sino")}
                >
                  <Text
                    style={[
                      styles.systemButtonText,
                      numberSystem === "sino" && styles.systemButtonTextActive,
                    ]}
                  >
                    Sino-Korean
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.systemButton,
                    numberSystem === "native" && styles.systemButtonActive,
                  ]}
                  onPress={() => setNumberSystem("native")}
                >
                  <Text
                    style={[
                      styles.systemButtonText,
                      numberSystem === "native" &&
                        styles.systemButtonTextActive,
                    ]}
                  >
                    Native Korean
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.setupLabel}>Digit Range</Text>
              <View style={styles.rangeButtons}>
                {[
                  "1-10",
                  "1-50",
                  "1-100",
                  "1-1000",
                  "1-10000",
                  "1-100000",
                  "1-1000000",
                  "1-100000000",
                ].map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.rangeButton,
                      digitRange === range && styles.rangeButtonActive,
                    ]}
                    onPress={() => setDigitRange(range)}
                  >
                    <Text
                      style={[
                        styles.rangeButtonText,
                        digitRange === range && styles.rangeButtonTextActive,
                      ]}
                    >
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.setupLabel}>Number of Questions</Text>
              <View style={styles.countButtons}>
                {["5", "10", "15", "20"].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.countButton,
                      quizItemCount === count && styles.countButtonActive,
                    ]}
                    onPress={() => setQuizItemCount(count)}
                  >
                    <Text
                      style={[
                        styles.countButtonText,
                        quizItemCount === count && styles.countButtonTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateNumbersQuiz}
              >
                <Ionicons name="flash" size={24} color="#FFF" />
                <Text style={styles.generateButtonText}>Generate Quiz</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Shuffle Numbers Setup */}
          {isShuffleQuiz && showShuffleNumbersSetup && (
            <View style={styles.numbersSetupSection}>
              <Text style={styles.setupTitle}>Generate Number Questions</Text>

              <Text style={styles.setupLabel}>Korean Number System</Text>
              <View style={styles.systemButtons}>
                <TouchableOpacity
                  style={[
                    styles.systemButton,
                    numberSystem === "sino" && styles.systemButtonActive,
                  ]}
                  onPress={() => setNumberSystem("sino")}
                >
                  <Text
                    style={[
                      styles.systemButtonText,
                      numberSystem === "sino" && styles.systemButtonTextActive,
                    ]}
                  >
                    Sino-Korean
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.systemButton,
                    numberSystem === "native" && styles.systemButtonActive,
                  ]}
                  onPress={() => setNumberSystem("native")}
                >
                  <Text
                    style={[
                      styles.systemButtonText,
                      numberSystem === "native" &&
                        styles.systemButtonTextActive,
                    ]}
                  >
                    Native Korean
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.setupLabel}>Digit Range</Text>
              <View style={styles.rangeButtons}>
                {[
                  "1-10",
                  "1-50",
                  "1-100",
                  "1-1000",
                  "1-10000",
                  "1-100000",
                  "1-1000000",
                  "1-100000000",
                ].map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.rangeButton,
                      digitRange === range && styles.rangeButtonActive,
                    ]}
                    onPress={() => setDigitRange(range)}
                  >
                    <Text
                      style={[
                        styles.rangeButtonText,
                        digitRange === range && styles.rangeButtonTextActive,
                      ]}
                    >
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.setupLabel}>Number of Questions</Text>
              <View style={styles.countButtons}>
                {["5", "10", "15", "20"].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.countButton,
                      quizItemCount === count && styles.countButtonActive,
                    ]}
                    onPress={() => setQuizItemCount(count)}
                  >
                    <Text
                      style={[
                        styles.countButtonText,
                        quizItemCount === count && styles.countButtonTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateNumbersQuiz}
              >
                <Ionicons name="flash" size={24} color="#FFF" />
                <Text style={styles.generateButtonText}>
                  Generate Questions
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Question Cards */}
          {questions.map((question, qIndex) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeaderRow}>
                <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>
                {isShuffleQuiz && question.contentType && (
                  <View
                    style={[
                      styles.contentTypeBadge,
                      {
                        backgroundColor:
                          question.contentType === "numbers"
                            ? "#9B59B6"
                            : question.contentType === "images"
                              ? "#FF6B6B"
                              : question.contentType === "audio"
                                ? "#4ECDC4"
                                : "#95E1D3",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        question.contentType === "numbers"
                          ? "calculator"
                          : question.contentType === "images"
                            ? "image"
                            : question.contentType === "audio"
                              ? "volume-high"
                              : "text"
                      }
                      size={14}
                      color="#FFF"
                    />
                    <Text style={styles.contentTypeText}>
                      {question.contentType}
                    </Text>
                  </View>
                )}
              </View>

              {getMediaInputComponent(question)}

              <TextInput
                style={styles.input}
                placeholder={
                  type === "audio" || question.contentType === "audio"
                    ? "Enter question (will be spoken)"
                    : "Enter question"
                }
                placeholderTextColor={"grey"}
                value={question.question}
                onChangeText={(text) =>
                  updateQuestion(question.id, "question", text)
                }
                multiline
                editable={isQuestionEditable(question)}
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
                editable={isQuestionEditable(question)}
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
                  editable={isQuestionEditable(question)}
                />
              ))}
            </View>
          ))}

          {/* Bottom Controls */}
          {questions.length > 0 && (
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
                {(isShuffleQuiz || (!isNumbersQuiz && !isShuffleQuiz)) && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addQuestion}
                  >
                    <Ionicons name="add-circle" size={24} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Question</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={handleFinishAndStart}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  <Text style={styles.finishButtonText}>
                    {isEditMode ? "Update & Test" : "Finish & Start Test"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Shuffle Add Question Modal */}
        <Modal
          visible={showShuffleModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowShuffleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons name="add-circle" size={60} color="#F38181" />
              <Text style={styles.modalTitle}>Add Question</Text>
              <Text style={styles.modalSubtitle}>Choose question type:</Text>

              <TouchableOpacity
                style={styles.shuffleOptionButton}
                onPress={handleShuffleNumbersGeneration}
              >
                <Ionicons name="calculator" size={32} color="#9B59B6" />
                <Text style={styles.shuffleOptionText}>
                  Numbers (Auto-generate)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shuffleOptionButton}
                onPress={() => handleShuffleAddQuestion("images")}
              >
                <Ionicons name="image" size={32} color="#FF6B6B" />
                <Text style={styles.shuffleOptionText}>Images</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shuffleOptionButton}
                onPress={() => handleShuffleAddQuestion("audio")}
              >
                <Ionicons name="volume-high" size={32} color="#4ECDC4" />
                <Text style={styles.shuffleOptionText}>
                  Audio (Text-to-Speech)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shuffleOptionButton}
                onPress={() => handleShuffleAddQuestion("text")}
              >
                <Ionicons name="text" size={32} color="#95E1D3" />
                <Text style={styles.shuffleOptionText}>Text Only</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowShuffleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Start Test Modal */}
        <Modal
          visible={showStartModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStartModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons name="rocket" size={60} color="#4A90E2" />
              <Text style={styles.modalTitle}>
                {isEditMode ? "Quiz Updated!" : "Ready to Start?"}
              </Text>
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
    borderLeftColor: "#9B59B6",
  },
  titleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9B59B6",
    marginBottom: 10,
  },
  titleInput: {
    borderWidth: 2,
    borderColor: "#9B59B6",
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    fontWeight: "600",
    backgroundColor: "#F5EBFF",
    color: "#333",
  },
  numbersSetupSection: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9B59B6",
    marginBottom: 20,
    textAlign: "center",
  },
  setupLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 15,
  },
  systemButtons: {
    flexDirection: "row",
    gap: 10,
  },
  systemButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9B59B6",
    alignItems: "center",
  },
  systemButtonActive: {
    backgroundColor: "#9B59B6",
  },
  systemButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9B59B6",
  },
  systemButtonTextActive: {
    color: "#FFF",
  },
  rangeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rangeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9B59B6",
  },
  rangeButtonActive: {
    backgroundColor: "#9B59B6",
  },
  rangeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9B59B6",
  },
  rangeButtonTextActive: {
    color: "#FFF",
  },
  countButtons: {
    flexDirection: "row",
    gap: 10,
  },
  countButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9B59B6",
    alignItems: "center",
  },
  countButtonActive: {
    backgroundColor: "#9B59B6",
  },
  countButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9B59B6",
  },
  countButtonTextActive: {
    color: "#FFF",
  },
  generateButton: {
    flexDirection: "row",
    backgroundColor: "#9B59B6",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: 10,
  },
  generateButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
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
  questionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9B59B6",
  },
  contentTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  contentTypeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
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
    backgroundColor: "#9B59B6",
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
    color: "#9B59B6",
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
  shuffleOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 18,
    borderRadius: 12,
    marginTop: 12,
    width: "100%",
    gap: 15,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  shuffleOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
