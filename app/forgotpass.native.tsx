import * as React from 'react';

import { View, TextInput, Text, StyleSheet } from "react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { auth } from "@/firebaseConfig"; // Your firebase config
import { sendPasswordResetEmail } from "firebase/auth"; // Firebase method to send a reset email

const ForgotPasswordScreen = () => {
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState(""); // If using code, implement logic
  const [newPassword, setNewPassword] = React.useState("");
  const [error, setError] = React.useState(""); // For error handling
  const [success, setSuccess] = React.useState(""); // For success messages

  // Handle password reset email
  const handleSendResetEmail = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("A verification code has been sent to your email.");
      setStep(2);
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
    }
  };

  // Handle code verification and password reset
  const handleResetPassword = () => {
    // Here you can use Firebase's password reset methods, or implement custom code verification logic.
    if (newPassword !== newPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Perform actual password reset logic if needed.
    setSuccess("Your password has been reset successfully.");
    router.replace("/"); // Redirect to home page after password reset.
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            <Text>Flow</Text>
            <Text style={{ color: "#7D6AE7" }}>state</Text>
          </Text>
          <ThemedText type="default" style={{ fontSize: 8 }}>
            Productivity Optimized.
          </ThemedText>
        </View>

        {step === 1 && (
          <View style={{ gap: 24 }}>
            <View>
              <ThemedText type="title">Need help?</ThemedText>
              <ThemedText>
                Kindly tell us the email you used in your FlowState account.
              </ThemedText>
            </View>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            {success && <Text style={styles.successText}>{success}</Text>}
            <View style={{ gap: 8 }}>
              <ThemedButton
                title="Confirm"
                type="default"
                onPress={handleSendResetEmail}
              />
              <ThemedButton
                title="Cancel"
                type="outlined"
                onPress={() => router.replace("/")}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 24 }}>
            <View>
              <ThemedText type="title">Enter Verification Code</ThemedText>
              <ThemedText>
                A verification code has been sent to your email.
              </ThemedText>
            </View>
            <TextInput
              placeholder="Verification Code"
              value={code}
              onChangeText={setCode}
              style={styles.input}
            />
            <View style={{ gap: 8 }}>
              <ThemedButton
                title="Confirm"
                type="default"
                onPress={() => setStep(3)}
              />
              <ThemedButton
                title="Cancel"
                type="outlined"
                onPress={() => setStep(1)}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: 24 }}>
            <ThemedText type="title">Create New Password</ThemedText>
            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              placeholder="Confirm Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            {success && <Text style={styles.successText}>{success}</Text>}
            <View style={{ gap: 8 }}>
              <ThemedButton
                type="default"
                title="Reset Password"
                onPress={handleResetPassword}
              />
              <ThemedButton
                type="outlined"
                title="Cancel"
                onPress={() => router.replace("/")}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBEF",
    paddingVertical: 32,
    paddingHorizontal: 36,
    justifyContent: "space-between",
  },
  logoContainer:{
    justifyContent: 'flex-start',
    alignSelf: 'center',
    paddingTop: 32
  },
  innerContainer: {
    justifyContent: 'space-around',
    flex: 0.8,
  },
  logo: {
    fontSize: 32,
    fontFamily: "Anton",
    textDecorationLine: 'underline',
    textDecorationColor: "#8075FF",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Montserrat'
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "center",
  },
  successText: {
    color: "green",
    fontSize: 12,
    textAlign: "center",
  },
});

export default ForgotPasswordScreen;