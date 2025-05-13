import * as React from 'react';

import { View, TextInput, TouchableOpacity, Switch, StyleSheet, Alert, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, updatePassword } from "firebase/auth";
import { db } from "@/firebaseConfig";
import CustomNavbar from "@/components/customNavbar";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notificationReminder, setNotificationReminder] = React.useState(true);
  const [vibrate, setVibrate] = React.useState(false);
  const [alarm, setAlarm] = React.useState(false);

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || user.email || "");
        setNotificationReminder(data.notificationReminder ?? true);
        setVibrate(data.vibrate ?? false);
        setAlarm(data.alarm ?? false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveUserData = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        firstName,
        lastName,
        email,
        notificationReminder,
        vibrate,
        alarm,
      });
      Alert.alert("Profile Updated");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Failed to save profile");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert("Password successfully changed!");
      setShowPasswordModal(false); 
      setNewPassword(""); 
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      Alert.alert("Failed to change password. Please try again.");
    }
  };
  
  return (
    <View style={mainStyles.container}>
      <View style={{ gap: 16 }}>
        <TouchableOpacity style={mainStyles.backContainer} onPress={() => navigation.goBack()}>
          <ThemedText type="big">Profile</ThemedText>
        </TouchableOpacity>

        <View style={{ gap: 8, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <ThemedText type="title">User Details</ThemedText>
            <ThemedButton type="small" title="Save" onPress={saveUserData} style={{ backgroundColor: "#8075FF" }} />
          </View>

          <View style={mainStyles.inputContainer}>
          <ThemedText>Last Name</ThemedText>
          <TextInput style={mainStyles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          </View>
          <View style={mainStyles.inputContainer}>
            <ThemedText>Last Name</ThemedText>
            <TextInput style={mainStyles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          </View>
          <View style={mainStyles.inputContainer}>
            <ThemedText>Email</ThemedText>
            <TextInput style={mainStyles.input} placeholder="Email" value={email} editable={false} />
          </View>

          <ThemedButton type="outlined" style={{ marginTop: 12 }} title="Change Password" onPress={() => setShowPasswordModal(true)} />
        </View>

        <View>
          <ThemedText type="title">Other Settings</ThemedText>
          <View style={mainStyles.row}>
            <ThemedText>Notification Reminder</ThemedText>
            <Switch
              value={notificationReminder}
              onValueChange={setNotificationReminder}
              thumbColor={notificationReminder ? "#8075FF" : "#ccc"}
              trackColor={{ true: "#B1AAFF" }}
            />
          </View>
          <View style={mainStyles.row}>
            <ThemedText>Vibrate</ThemedText>
            <Switch
              value={vibrate}
              onValueChange={setVibrate}
              thumbColor={vibrate ? "#8075FF" : "#ccc"}
              trackColor={{ true: "#B1AAFF" }}
            />
          </View>
          <View style={mainStyles.row}>
            <ThemedText>Alarm</ThemedText>
            <Switch
              value={alarm}
              onValueChange={setAlarm}
              thumbColor={alarm ? "#8075FF" : "#ccc"}
              trackColor={{ true: "#B1AAFF" }}
            />
          </View>
        </View>
      </View>

      <ThemedButton type="outlined" title="Logout" onPress={() => auth.signOut()} />

      <Modal visible={showPasswordModal} animationType="fade" transparent={true} onRequestClose={() => setShowPasswordModal(false)}>
        <View style={modal.modalBackground}>
          <View style={modal.modalContainer}>
            <ThemedText type="title">Enter New Password</ThemedText>
            <View style={{gap: 8}}>
              <TextInput
                style={modal.input}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={modal.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <View style={{gap: 4}}>
              <ThemedButton title="Save" type="default" onPress={handleChangePassword} />
              <ThemedButton title="Cancel" type="outlined" onPress={() => setShowPasswordModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <CustomNavbar selectedIcon="profile" />

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
    gap: 24
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Montserrat'
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBEF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 128
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 32
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    paddingVertical: 12,
    fontSize: 14,
  },
});

export default ProfileScreen;
