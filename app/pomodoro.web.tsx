import { Pause, Skip, Settings, Play, Exit } from "@/components/Icons";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import * as React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
  StyleSheet,
  Animated,
  Vibration,
  Image,
} from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const PomodoroTimer = () => {
  const [time, setTime] = React.useState(25 * 60);
    const [isRunning, setIsRunning] = React.useState(false);
    const [isBreak, setIsBreak] = React.useState(false);
    const [hasStarted, setHasStarted] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [startTimestamp, setStartTimestamp] = React.useState<number | null>(null);
    const [endTimestamp, setEndTimestamp] = React.useState<number | null>(null);
  
    const [workInterval, setWorkInterval] = React.useState(25 * 60);
    const [breakInterval, setBreakInterval] = React.useState(5 * 60);
    const [workInput, setWorkInput] = React.useState("25");
    const [breakInput, setBreakInput] = React.useState("5");
  
    const [remotelyStopped, setRemotelyStopped] = React.useState(false);
  
    const [notificationReminder, setNotificationReminder] = React.useState(true);
    const [vibrate, setVibrate] = React.useState(false);
    const [alarm, setAlarm] = React.useState(false);
    const [userName, setUserName] = React.useState("");
  
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const slideValue = React.useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = React.useState(0);
  
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user?.uid;
  
    React.useEffect(() => {
      if (!userId) return;
      loadUserData();
      const unsubscribe = subscribeToTimerState();
      return () => unsubscribe();
    }, [userId]);
  
    const loadUserData = async () => {
      const userRef = doc(db, "users", userId!);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setNotificationReminder(data.notificationReminder ?? true);
        setVibrate(data.vibrate ?? false);
        setAlarm(data.alarm ?? false);
        setUserName(data.firstName || "");
      }
    };
  
    const subscribeToTimerState = () => {
      const ref = doc(db, "users", userId!, "pomodoro", "state");
      return onSnapshot(ref, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTime(data.time);
          setIsRunning(data.isRunning);
          setIsBreak(data.isBreak);
          setWorkInterval(data.workInterval);
          setBreakInterval(data.breakInterval);
          const started = data.isRunning || data.time !== data.workInterval;
          setHasStarted(started);
          setRemotelyStopped(!data.isRunning && data.time === data.workInterval && hasStarted);
          setStartTimestamp(data.startTimestamp ?? null);
          setEndTimestamp(data.endTimestamp ?? null);
        }
      });
    };
  
    const saveTimerState = async (updates: any) => {
      const ref = doc(db, "users", userId!, "pomodoro", "state");
      await setDoc(ref, updates, { merge: true });
    };
  
    const saveUserSettings = async () => {
      const ref = doc(db, "users", userId!);
      await updateDoc(ref, {
        notificationReminder,
        vibrate,
        alarm,
      });
    };
  
    React.useEffect(() => {
      const handleVisibilityChange = () => {
        if (
          document.visibilityState === "visible" &&
          isRunning &&
          startTimestamp !== null &&
          endTimestamp !== null
        ) {
          const remaining = Math.floor((endTimestamp - Date.now()) / 1000);
          setTime(Math.max(0, remaining));
        }
      };
    
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, [isRunning, startTimestamp, endTimestamp]);
    
  
    React.useEffect(() => {
      if (!isRunning || startTimestamp === null || endTimestamp === null) return;
  
      timerRef.current = setInterval(() => {
        const remaining = Math.floor((endTimestamp - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(timerRef.current!);
  
          if (vibrate) {
            Vibration.vibrate();
            setTimeout(() => Vibration.vibrate(), 400);
            setTimeout(() => Vibration.vibrate(), 800);
          }
  
          const nextIsBreak = !isBreak;
          const nextInterval = nextIsBreak ? breakInterval : workInterval;
          const newStart = Date.now();
          const newEnd = newStart + nextInterval * 1000;
  
          setIsBreak(nextIsBreak);
          setStartTimestamp(newStart);
          setEndTimestamp(newEnd);
          setTime(nextInterval);
  
          saveTimerState({
            isRunning: true,
            isBreak: nextIsBreak,
            time: nextInterval,
            startTimestamp: newStart,
            endTimestamp: newEnd,
          });
        } else {
          setTime(remaining);
        }
      }, 1000);
  
      return () => clearInterval(timerRef.current!);
    }, [isRunning, isBreak, startTimestamp, endTimestamp, workInterval, breakInterval, vibrate]);
  
    const handleStart = () => {
      const workSec = parseInt(workInput) * 60;
      const breakSec = parseInt(breakInput) * 60;
      const now = Date.now();
      const end = now + workSec * 1000;
  
      setHasStarted(true);
      setIsRunning(true);
      setWorkInterval(workSec);
      setBreakInterval(breakSec);
      setStartTimestamp(now);
      setEndTimestamp(end);
      setTime(workSec);
  
      saveTimerState({
        isRunning: true,
        isBreak: false,
        time: workSec,
        workInterval: workSec,
        breakInterval: breakSec,
        startTimestamp: now,
        endTimestamp: end,
      });
    };
  
    const handlePauseResume = () => {
      if (isRunning) {
        clearInterval(timerRef.current!);
        setIsRunning(false);
        saveTimerState({ isRunning: false, time });
      } else {
        const now = Date.now();
        const end = now + time * 1000;
        setStartTimestamp(now);
        setEndTimestamp(end);
        setIsRunning(true);
        saveTimerState({
          isRunning: true,
          time,
          isBreak,
          startTimestamp: now,
          endTimestamp: end,
        });
      }
    };
  
    const handleSkip = () => {
      const nextIsBreak = !isBreak;
      const nextTime = nextIsBreak ? breakInterval : workInterval;
      const newStart = Date.now();
      const newEnd = newStart + nextTime * 1000;
      setTime(nextTime);
      setIsBreak(nextIsBreak);
      setStartTimestamp(newStart);
      setEndTimestamp(newEnd);
      saveTimerState({
        isBreak: nextIsBreak,
        time: nextTime,
        startTimestamp: newStart,
        endTimestamp: newEnd,
      });
    };
  
    const saveSettings = () => {
      const newWork = parseInt(workInput) * 60;
      const newBreak = parseInt(breakInput) * 60;
      setWorkInterval(newWork);
      setBreakInterval(newBreak);
      setTime(newWork);
      saveTimerState({ workInterval: newWork, breakInterval: newBreak, time: newWork });
      saveUserSettings();
      setModalVisible(false);
    };

  return (
    <View style={styles.container}>
      {hasStarted && (
        <Image
          source={isBreak ? require('@/assets/images/Rest.gif') : require('@/assets/images/Freelancer.gif')}
          style={styles.image}
        />
      )}
      <View style={styles.innerContainer}>
        <ThemedText type="big">{hasStarted ? (isBreak ? "Break" : "Focus") : "Ready?"}</ThemedText>
        {!hasStarted ? (
          <>
            <ThemedText style={{ marginBottom: 16, width: 384, marginVertical: 24 }}>
              Set up your surroundings, grab your coffee, and press Start.
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={handleStart} style={styles.button}><Play /></TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}><Settings /></TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace({ pathname: "/home", params: { stopPomodoro: "true" } })} style={[styles.button, { borderColor: '#F40000' }]}><Exit /></TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={{ justifyContent: "space-between", height: 320 }}>
              <View>
                <Text style={styles.timer}>{`${Math.floor(time  / 60)}:${String(time  % 60).padStart(2, "0")}`}</Text>
                <ThemedText style={{ marginTop: -18 }}>{isBreak ? "Take some break!" : `You're doing great, ${userName}!`}</ThemedText>
              </View>
              <View style={styles.buttons}>
                <TouchableOpacity onPress={handlePauseResume} style={styles.button}>{isRunning ? <Pause /> : <Play />}</TouchableOpacity>
                <TouchableOpacity onPress={handleSkip} style={styles.button}><Skip /></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}><Settings /></TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace({ pathname: "/home", params: { stopPomodoro: "true" } })} style={[styles.button, { borderColor: '#F40000' }]}><Exit /></TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={{ alignItems: "center", gap: 16 }}>
              <ThemedText type="title">Settings</ThemedText>
              <View style={styles.row}>
                <ThemedText>Work:</ThemedText>
                <TextInput style={styles.input} keyboardType="numeric" value={workInput} onChangeText={setWorkInput} />
                <ThemedText>min</ThemedText>
              </View>
              <View style={styles.row}>
                <ThemedText>Break:</ThemedText>
                <TextInput style={styles.input} keyboardType="numeric" value={breakInput} onChangeText={setBreakInput} />
                <ThemedText>min</ThemedText>
              </View>
              <ThemedButton title="Save Changes" onPress={saveSettings} />
            </View>
            <View style={{ alignItems: "center", gap: 24 }}>
              <ThemedText type="title">Preferences</ThemedText>
              <View style={[styles.row, { width: 240, justifyContent: 'space-between' }]}>
                <ThemedText>Notification:</ThemedText>
                <Switch value={notificationReminder} onValueChange={setNotificationReminder} />
              </View>
              <View style={[styles.row, { width: 240, justifyContent: 'space-between' }]}>
                <ThemedText>Vibrate:</ThemedText>
                <Switch value={vibrate} onValueChange={setVibrate} />
              </View>
              <View style={[styles.row, { width: 240, justifyContent: 'space-between' }]}>
                <ThemedText>Alarm:</ThemedText>
                <Switch value={alarm} onValueChange={setAlarm} />
              </View>
              <ThemedButton title="Close Settings" style={{ marginTop: 32 }} type="outlined" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFE5",
    paddingVertical: 38,
    paddingHorizontal: 42,
    justifyContent: "center",
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16
  },
  innerContainer: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  timer: { fontSize: 128, fontFamily: 'Anton', padding: -16 },
  buttons: { flexDirection: "row", gap: 20 },
  button: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderColor: '#090809',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 58,
    aspectRatio: 1
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 235, 235, 0.8)',
  },
  modalContainer: {
    width: '100%',
    height: '70%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Montserrat',
    width: 32
  },
  image: {
    height: 650,
    width: 650,
  }
});

export default PomodoroTimer;
