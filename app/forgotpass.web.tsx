import * as React from 'react';

import { View, TextInput, Text, StyleSheet } from "react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { auth } from "@/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordScreen = () => {
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

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

  const handleResetPassword = () => {
    if (newPassword !== newPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSuccess("Your password has been reset successfully.");
    router.replace("/");
  };

  return (
    <View style={styles.body}>
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
              <View style={{ gap: 16 }}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#F8FBEF",
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  container: {
    width: 720,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer:{
    justifyContent: 'flex-start',
    alignSelf: 'center',
    paddingTop: 32
  },
  innerContainer: {
    gap: 48,
    paddingVertical: 32,
    paddingHorizontal: 36,
    justifyContent: 'center',
    borderRadius: 16,
    borderColor: '#ccc',
    borderWidth: 1,
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
    fontSize: 16,
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
    fontSize: 14,
    textAlign: "center",
  },
  successText: {
    color: "green",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ForgotPasswordScreen;