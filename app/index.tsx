import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../assets/images/logo.png")} 
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>Feelfree</Text>
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>
        Your mental health <Text style={styles.highlight}>matters</Text>
      </Text>
      <Text style={styles.subtitle}>
        Connect with Feelfree, your compassionate AI companion designed to
        provide support, guidance, and a safe space for your mental wellness journey.
      </Text>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={styles.primaryWrapper}>
          <LinearGradient colors={["#3b82f6", "#34d399"]} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Start Chatting</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          
          <Text style={styles.secondaryText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      {/* Features Row */}
      <View style={styles.featuresRow}>
        <View style={styles.feature}>
          <Ionicons name="chatbubbles-outline" size={20} color="#666" />
          <Text style={styles.featureText}>100% Confidential</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.featureText}>24/7 Available</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
          <Text style={styles.featureText}>Professional Support</Text>
        </View>
      </View>

      {/* Why Choose Section */}
      <Text style={styles.sectionTitle}>Why choose Feelfree?</Text>
      <Text style={styles.sectionSubtitle}>
        Our AI companion is designed with your wellbeing in mind, offering personalized support whenever you need it most.
      </Text>

      {/* Cards */}
      <View style={styles.card}>
        <Ionicons name="lock-closed-outline" size={24} color="#f5a623" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Private & Secure</Text>
          <Text style={styles.cardText}>Your conversations are confidential and encrypted.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Ionicons name="heart-outline" size={24} color="#4facfe" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Empathetic Support</Text>
          <Text style={styles.cardText}>AI trained to respond with empathy and emotional intelligence.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Ionicons name="time-outline" size={24} color="#43e97b" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Always Available</Text>
          <Text style={styles.cardText}>Get support whenever you need it — 24/7.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fbfcfc",
    flexGrow: 5,
    marginTop: 20,
    justifyContent: "center",
  },

  // Header
  logoContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "flex-start",
  },
  logoImage: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    paddingTop: 4,
  },

  // Title & Subtitle
  title: {
    fontSize: 55,
    width: "100%",
    height: 200,
    textDecorationStyle: "double",
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 12,
    
  },
  highlight: {
    color: "#4facfe",
    
  },
  subtitle: {
    textDecorationColor: "#4facfe",
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
    paddingHorizontal: 10,
    height: 100,
    marginTop: 15,
  },

  // Buttons
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 25,
    height: 120,
  },
  primaryWrapper: {
    width: "85%",
    marginBottom: 12,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    width: "85%",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor:"#95becaff"
  },
  secondaryText: {
    color: "#f9fdfdff",
    fontSize: 15,
  },

  // Features
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
    flexWrap: "wrap",
  },
  feature: {
    alignItems: "center",
    marginBottom: 10,
    width: width / 3.5,
  },
  featureText: {
    fontSize: 12,
    color: "#555",
    marginTop: 6,
    textAlign: "center",
  },

  // Section
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
    lineHeight: 20,
  },

  // Cards
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});
