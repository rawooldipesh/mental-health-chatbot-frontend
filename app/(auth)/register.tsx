import React, { useState } from "react";
import { router, Stack } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { register as registerApi } from "../../services/authService";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleRegister = async () => {
    setErr(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErr("Please fill all fields.");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setErr("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await registerApi({ name,email, password });
      Alert.alert("Success", "Account created! Please sign in.");
      router.replace("/(auth)/login");
    } catch (e: any) {
      console.log(e);
      setErr(e?.message || "Registration failed. Please try again.");
      Alert.alert("Registration failed", e?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1, width: "100%" }}
      >
        {/* Back to Home */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/")}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <Ionicons name="arrow-back" size={20} color="#6c63ff" />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>

        {/* Card */}
        <View style={styles.centerWrapper}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Ionicons name="heart-outline" size={30} color="white" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us for personalized mental health support
          </Text>
          {/* Name */}
<Text style={styles.label}>Name</Text>
<TextInput
  style={styles.input}
  placeholder="Enter your name"
  placeholderTextColor="#aaa"
  value={name}
  onChangeText={setName}
  accessibilityLabel="Name"
/>
         
          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Email"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            accessibilityLabel="Confirm Password"
          />

          {/* Error */}
          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Create Account"
          >
            <LinearGradient
              colors={["#3b82f6", "#34d399"]}
              style={[styles.gradientBtn, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signInText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.signupText}
              onPress={() => router.push("/(auth)/login")}
            >
              Sign in
            </Text>
          </Text>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    paddingTop: 40,
  },
  backBtn: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginLeft: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#6c63ff",
  },
  card: {
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 5,
    marginTop: 10,
    color: "#111",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  passwordWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  errorText: {
    width: "100%",
    color: "#DC2626",
    marginTop: 6,
    marginBottom: 4,
    fontSize: 12,
  },
  signInBtn: {
    width: "100%",
    marginVertical: 15,
  },
  gradientBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  signInText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  signupText: {
    color: "#6c63ff",
    fontWeight: "600",
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});
