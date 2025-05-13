import * as React from 'react';

import { View, Text, TextInput, StyleSheet, Modal } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";

const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [error, setError] = React.useState("");

  const [registerModal, setRegisterModal] = React.useState(false);
  const [registerSuccess, setRegisterSuccess] = React.useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setRegisterSuccess(false);
      setRegisterModal(true);
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
  
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: fname,
        lastName: lname,
        createdAt: new Date().toISOString(),
        alarm: false,
        notificationReminder: true,
        vibrate: false,
      });
  
      setIsRegistered(true);
      setRegisterSuccess(true);
      setRegisterModal(true);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
      setRegisterSuccess(false);
      setRegisterModal(true);
    }
  };  

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}><Text>Flow</Text><Text style={{ color: "#7D6AE7" }}>state</Text></Text>
          <ThemedText type="default" style={{fontSize: 8}}>Productivity Optimized.</ThemedText>
        </View>

        {isRegistered ? (
          <View style={styles.successContainer}>
            <View>
              <ThemedText type="title" style={{textAlign: "center"}}>Registration Success!</ThemedText>
              <ThemedText style={{textAlign: "center"}}>
                Welcome to Flowstate! Please login to your account to get started.
              </ThemedText>
            </View>
            <ThemedButton title="Continue" type="default" style={{width: 358}} onPress={() => router.push("/")} />
          </View>
        ) : (
          <View style={{gap: 24}}>
            <View>
              <ThemedText type="title">Register</ThemedText>
              <ThemedText>Hello! Welcome to Flowstate!</ThemedText>
            </View>

            <View style={{gap: 16}}>
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
              <TextInput placeholder="First Name" value={fname} onChangeText={setFname} style={styles.input} />
              <TextInput placeholder="Last Name" value={lname} onChangeText={setLname} style={styles.input} />
              <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
              <TextInput placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} />
              {error !== "" && <ThemedText style={{ color: "red", fontSize: 12 }}>{error}</ThemedText>}
            </View>

            <View style={{gap: 8, marginTop: 32}}>
              <ThemedButton title="Register" type="default" onPress={handleRegister} />
              <ThemedButton title="Go back to Login" type="outlined" onPress={() => router.replace("/")} />
            </View>
          </View>
        )}
      </View>
      <Modal visible={registerModal} animationType="fade" transparent={true}>
        <View style={modal.modalBackground}>
          <View style={modal.modalContainer}>
            <ThemedText type="title">
              {registerSuccess ? "Registration Successful!" : "Registration Failed"}
            </ThemedText>

            <ThemedText style={{ marginTop: 8 }}>
              {registerSuccess
                ? "Welcome to Flowstate! We can't wait to do awesome things with you. Please press the button to continue."
                : error || "Something went wrong. Please try again."}
            </ThemedText>

            <View style={{ gap: 8, marginTop: 24 }}>
              <ThemedButton
                title={registerSuccess ? "Get Started" : "Try again"}
                type="default"
                onPress={() => {
                  setRegisterModal(false);
                  if (registerSuccess) {
                    router.replace("/");
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const modal = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    gap: 16
  },
});

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
    flex: 0.9,
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
  successContainer: {
    alignItems: "center",
    gap: 16,
    flex: 0.5
  },
});

export default RegisterScreen;
