import { Pause, Skip, Settings, Play } from "@/components/Icons";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import * as React from 'react';

import { BlurView } from 'expo-blur';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
  StyleSheet,
  Animated,
  PanResponder,
  Image,
  Vibration,
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
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
  
            if (vibrate) {
              Vibration.vibrate([200, 200, 200]);
            }
  
            const nextTime = isBreak ? workInterval : breakInterval;
            saveTimerState({ time: nextTime, isRunning: true, isBreak: !isBreak });
            return nextTime;
          }
  
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }
  
    return () => clearInterval(timerRef.current!);
  }, [isRunning, isBreak, workInterval, breakInterval, vibrate]);
  

  const handleStart = () => {
    const workSec = parseInt(workInput) * 60;
    const breakSec = parseInt(breakInput) * 60;
    setHasStarted(true);
    setIsRunning(true);
    setWorkInterval(workSec);
    setBreakInterval(breakSec);
    setTime(workSec);
    saveTimerState({
      time: workSec,
      isRunning: true,
      isBreak: false,
      workInterval: workSec,
      breakInterval: breakSec,
    });
  };

  const handlePauseResume = () => {
    setIsRunning((prev) => {
      const newVal = !prev;
      saveTimerState({ isRunning: newVal, time });
      return newVal;
    });
  };
  
  const handleSkip = () => {
    const nextIsBreak = !isBreak;
    const nextTime = nextIsBreak ? breakInterval : workInterval;
    setTime(nextTime);
    setIsBreak(nextIsBreak);
    saveTimerState({ isBreak: nextIsBreak, time: nextTime });
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

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (gesture.dx >= 0 && gesture.dx <= containerWidth - 36) {
        slideValue.setValue(gesture.dx);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > containerWidth * 0.8) {
        router.replace({ pathname: "/home", params: { stopPomodoro: "true" } });
      }
      Animated.spring(slideValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <View style={styles.container}>
      <ThemedText type="big">{hasStarted ? (isBreak ? "Break" : "Focus") : "Ready?"}</ThemedText>
      <View style={styles.innerContainer}>
        {hasStarted && (
          <Image
            source={isBreak ? require('@/assets/images/Freelancer.gif') : require('@/assets/images/focus.png')}
            style={styles.image}
          />
        )}
        {!hasStarted ? (
          <>
            <ThemedText style={{ marginBottom: 16, textAlign: "center" }}>
              Set up your surroundings, grab your coffee, and press Start.
            </ThemedText>
            <View style={styles.row}>
              <TouchableOpacity onPress={handleStart} style={styles.button}>
                <Play />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                <Settings />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.row, {justifyContent: 'center', alignItems: 'center'}]}>
              <Text style={styles.timer}>
                {`${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`}
              </Text>
              <ThemedText style={{flex: 0.6, marginBottom: -12}}>
                {isBreak ? "Take some break!" : `You're doing great, ${userName}!`}
              </ThemedText>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={handlePauseResume} style={styles.button}>
                {isRunning ? <Pause /> : <Play />}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSkip} style={styles.button}>
                <Skip />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                <Settings />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View
        style={styles.slideContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <ThemedText style={styles.slideText}>Slide to exit</ThemedText>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.slider, { transform: [{ translateX: slideValue }] }]}
        >
          <ThemedText style={styles.arrow}>→</ThemedText>
        </Animated.View>
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <BlurView intensity={100} tint="light" style={styles.modalContainer}>
            <View style={{ alignItems: "center", gap: 16 }}>
              <ThemedText type="title">Settings</ThemedText>
              <View style={styles.row}>
                <ThemedText>Work:</ThemedText>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={workInput}
                  onChangeText={setWorkInput}
                />
                <ThemedText>min</ThemedText>
              </View>
              <View style={styles.row}>
                <ThemedText>Break:</ThemedText>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={breakInput}
                  onChangeText={setBreakInput}
                />
                <ThemedText>min</ThemedText>
              </View>
              <ThemedButton title="Save Changes" onPress={saveSettings} />
            </View>
            <View style={{ alignItems: "center", gap: 16 }}>
              <ThemedText type="title">Preferences</ThemedText>
              <View style={[styles.row, {width: '70%' ,justifyContent: 'space-between'}]}>
                <ThemedText>Notification:</ThemedText>
                <Switch value={notificationReminder} onValueChange={setNotificationReminder} />
              </View>
              <View style={[styles.row, {width: '70%' ,justifyContent: 'space-between'}]}>
                <ThemedText>Vibrate:</ThemedText>
                <Switch value={vibrate} onValueChange={setVibrate} />
              </View>
              <View style={[styles.row, {width: '70%' ,justifyContent: 'space-between'}]}>
                <ThemedText>Alarm:</ThemedText>
                <Switch value={alarm} onValueChange={setAlarm} />
              </View>
              <ThemedButton title="Close Settings" type="outlined" onPress={() => setModalVisible(false)} />
            </View>
          </BlurView>
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
    justifyContent: "space-around",
    alignItems: 'center'
  },
  innerContainer: {
    alignItems: 'center'
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  timer: { fontSize: 36, fontFamily: 'Anton', marginVertical: 20 },
  buttons: { 
    flexDirection: "row",
    gap: 20 },
  button: { 
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderColor: '090809',
    borderStyle: 'solid',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    height: 58,
    aspectRatio: 1/1
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 80,
    paddingVertical: '25%',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Montserrat'
  },
  exitButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF5252',
    borderRadius: 8,
  },
  slideContainer: {
    width: '80%',
    height: 42,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slider: {
    width: '120%',
    height: 42,
    borderRadius: 999,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "flex-end",
    position: "absolute",
    paddingHorizontal: 12,
    left: '-105%',
  },
  arrow: {
    color: "#F8FFE5",
    fontSize: 24,
  },
  slideText: {
    position: "absolute",
    alignSelf: "center",
    color: "#888",
  },
  
  image: { width: 276, height: 276,}
});

export default PomodoroTimer;