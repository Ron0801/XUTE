import * as React from 'react';

import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Checkbox } from "react-native-paper";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { auth } from "@/firebaseConfig";
import { useAuth } from "@/components/authContext";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect } from "react";

const LoginScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}><Text>Flow</Text><Text style={{ color: "#7D6AE7" }}>state</Text></Text>
          <ThemedText type="default" style={{fontSize: 8}}>Productivity Optimized.</ThemedText>
        </View>

        <View style={{gap: 24}}>
          <View>
            <ThemedText type="title">Login</ThemedText>
            <ThemedText type="default">Welcome back! Please login to continue.</ThemedText>
          </View>

          <View style={{gap: 16}}>
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} autoCapitalize="none"/>
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} autoCapitalize="none" secureTextEntry />
            <View style={styles.row}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={rememberMe ? "checked" : "unchecked"}
                  onPress={() => setRememberMe(!rememberMe)}
                />
                <ThemedText style={{fontSize: 12}}>Remember Me</ThemedText>
              </View>
              <TouchableOpacity onPress={() => router.push("./forgotpass")}>
                <ThemedText type="link">Forgot Password?</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{marginTop: 32,gap: 12}}>
            <ThemedButton type="default" title="Login" onPress={handleLogin} />
            <ThemedButton
              type="outlined"
              title="Continue with Google"
            />
          </View>
        </View>
      </View>

      <ThemedText style={{fontSize: 12, textAlign: "center"}}>
        Don’t have an account yet? 
        <ThemedText type="link" onPress={() => router.push("./register")}>
          {' Register'}
        </ThemedText>
      </ThemedText>
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
});

export default LoginScreen;