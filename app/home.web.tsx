import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal, TextInput} from 'react-native';
import { useFonts } from 'expo-font';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import  WebCalendar  from "@/components/WebCalendar";
import WebTasksToday from '@/components/WebTasksToday';
import WebAddTask from '@/components/WebAddTask';
import { Pomodoro, Settings } from '@/components/Icons';
import { ThemedButton } from '@/components/ThemedButton';
import WebSettings from '@/components/WebSettings';
import WebEditTask from '@/components/WebEditTask';

function Dashboard() {
  
const user = auth.currentUser;
const [firstname, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [notificationReminder, setNotificationReminder] = useState(true);
const [vibrate, setVibrate] = useState(false);
const [alarm, setAlarm] = useState(false);

const [showSettingsModal, setshowSettingsModal] = useState(false);

const [showEditModal, setshowEditModal] = useState(false);
const [selectedTaskId, setSelectedTaskId] = useState('');

const handleTaskClick = (taskId: string) => {
  setSelectedTaskId(taskId);
  setshowEditModal(true);
};

const [workInterval, setWorkInterval] = useState(0);
const [breakInterval, setBreakInterval] = useState(0);

const loadUserData = async () => {
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setFirstName(data.firstName || '');
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

const loadUserSettings = async () => {
  try {
    const docRef = doc(db, "users", user.uid,"pomodoro", "state");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setWorkInterval(data.workInterval || '');
      setBreakInterval(data.breakInterval || '');
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
};

useEffect(() => {
  if (user) {
    loadUserData();
    loadUserSettings();
  }
}, [user]);

const { stopPomodoro } = useLocalSearchParams();
const userId = auth.currentUser?.uid;
  
useEffect(() => {
  const stopPomodoroTimer = async () => {
    if (!userId) return;

    const ref = doc(db, "users", userId, "pomodoro", "state");
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const workInterval = data.workInterval ?? 25 * 60;
      await setDoc(
        ref,
        {
          time: workInterval,
          isRunning: false,
          isBreak: false,
        },
        { merge: true }
      );
    }
  };

  if (stopPomodoro === "true") {
    stopPomodoroTimer();
  }
}, [stopPomodoro, userId]);

  useFonts({
    'Anton': require('@/assets/fonts/Anton.ttf'),
    'Montserrat': require('@/assets/fonts/Montserrat.ttf'),
  });  
  return (
  <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 48, backgroundColor: '#F8FBEF'}}>
    <View style={[styles.row, {width: '100%'}]}>
      <Image source={require('@/assets/img/logo.png')} />
      <View style={[styles.row, {gap: 16}]}>
        <View>
            <ThemedText type='title' style={{textAlign: 'right'}} >Hello, {firstname}</ThemedText>
            <ThemedText style={{textAlign: 'right'}}>Ready to do some work?</ThemedText>
        </View>
        <TouchableOpacity onPress={() => setshowSettingsModal(true)}>
          <Settings />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.body}>
      <View style={styles.leftBody}>
        <WebCalendar handleTaskClick={handleTaskClick} />
      </View> 

      <View style={styles.rightBody}> 
        <View style={styles.rightTop}>
          <Text style={{ fontSize: 26, fontFamily: 'Anton' }}>Pomodoro Timer</Text>
          <View style={styles.timer}> 
            <View style={{ alignItems:'center'}}>
              <Text style={{ fontSize: 56, fontFamily: 'Anton' }}>{`${Math.floor(workInterval / 60)}:${String(workInterval % 60).padStart(2, "0")}`}</Text>
              <Text style={{ fontSize: 16, fontFamily: 'Montserrat' }}>Work</Text>
            </View>

            <View style={{ alignItems:'center'}}>
              <Text style={{ fontSize: 56, fontFamily: 'Anton' }}>{`${Math.floor(breakInterval / 60)}:${String(breakInterval % 60).padStart(2, "0")}`}</Text>
              <Text style={{ fontSize: 16, fontFamily: 'Montserrat' }}>Break</Text>
            </View>

            <View style={{ alignContent:'center', width:'26%'}}>
              <TouchableOpacity style={styles.middleBtn} onPress={() => router.push("/pomodoro")}>
                <Pomodoro />
                <ThemedText type="default" style={{ color: '#F8FBEF', marginBottom: -2 }}>
                  Pomodoro
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View> 
          
        <View style={styles.rightBottom}>
          <View style={styles.bottomLeft}>
            <WebAddTask />
          </View> 
          <View style={styles.bottomRight}>
            <WebTasksToday />  
          </View>
        </View>
      </View>
    </View>

    <Modal visible={showSettingsModal} animationType="fade" transparent={true} onRequestClose={() => setshowSettingsModal(false)}>
      <View style={modal.modalBackground}>
        <View style={modal.modalContainer}>
          <WebSettings/>
          <ThemedButton title="Close Settings" type="outlined" onPress={() => setshowSettingsModal(false)} />
        </View>
      </View>
    </Modal>

    <Modal
      visible={showEditModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setshowEditModal(false)}
    >
      <View style={modal.modalBackground}>
        <View style={modal.modalContainer}>
          <WebEditTask
            taskId={selectedTaskId}
            onClose={() => setshowEditModal(false)}
          />
          <ThemedButton
            title="Close Settings"
            type="outlined"
            onPress={() => setshowEditModal(false)}
          />
        </View>
      </View>
    </Modal>

  </ScrollView>    
       );
  }

export default Dashboard;

const modal = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#F8FBEF",
    padding: 32,
    borderRadius: 10,
    width: 520,
    gap: 24
  },
})

const styles = StyleSheet.create({
//-------
row: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

middleBtn: {
  backgroundColor: '#8075FF',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  borderRadius: 99,
  gap: 8,
  padding: 16,
},
//------
container: {
  backgroundColor: '#F8FBEF',
  alignItems: 'center',     
  padding: 45,
},

body:{
  width: '100%',
  marginTop: 24,
  flexDirection: 'row',
  gap: 10,
  flexWrap: 'wrap'
 },

leftBody:{
  flex: 3,
  height:'100%',
  borderColor: '#2b2b2b',
  borderWidth: 2,
  padding: 32
},

rightBody:{
  flex: 7,
  gap: 10
},

rightTop:{
  flex: 1,
  height: '30%',
  
  borderColor: '#2b2b2b',
  borderWidth: 2,
  padding: 36,
  alignItems:'center'
},

timer:{
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '50%',
  alignItems:'center'
},

rightBottom:{
  flex: 4,
  flexDirection:'row',
  gap: 10,
  minHeight: 860,

},

bottomLeft:{
  flex: 6,
  minHeight: 860,
  height: '100%',
  borderColor: '#2b2b2b',
  borderWidth: 2,
  padding: 32,
  justifyContent: 'space-between'
},

bottomRight:{
  width: '58%',
  justifyContent: 'space-between',
  borderColor: '#2b2b2b',
  borderWidth: 2,
  padding: 32,
},

text:{
  fontWeight: 'bold',
  fontSize: 24
},

taskContainer:{
  justifyContent: 'flex-start',
  alignItems:'center',
  flexDirection: 'row',
  paddingVertical: 12, 
  paddingHorizontal: 16,
  backgroundColor: '#090809',
  borderRadius: 8,

},

task:{
  padding: 8,
  borderWidth: 1,
  borderRightColor: "#F8FFE5",
  marginRight:16,
  width: 90
},

date:{
  fontFamily: 'Montserrat',
  fontSize: 14,
  color: '#F8FFE5',

},

taskName:{
  fontFamily: 'Montserrat',
  fontSize: 14,
  color: '#F8FFE5',
},

prioLevel:{
  fontFamily: 'Montserrat',
  fontSize: 8,
  color: '#F8FFE5',
},

high:{
  fontFamily: 'Montserrat',
  fontSize: 8,
  color: '#8075FF',
},


taskContainer2:{
  justifyContent: 'flex-start',
  alignItems:'center',
  flexDirection: 'row',
  paddingVertical: 12, 
  paddingHorizontal: 16,
  borderRadius: 8,
  borderBottomWidth: 1,
  borderBottomColor: "#09080966",


},

task2:{
  padding: 8,
  borderRightWidth: 1,
  borderRightColor: "#090809",

  marginRight:16,
  width: 90
},

date2:{
  fontFamily: 'Montserrat',
  fontSize: 14,
  color: '#090809',

},

taskName2:{
  fontFamily: 'Montserrat',
  fontSize: 14,
  color: '#090809',
},

prioLevel2:{
  fontFamily: 'Montserrat',
  fontSize: 8,
  color: '#090809',
},

high2:{
  fontFamily: 'Montserrat',
  fontSize: 8,
  color: '090809',
},

checkboxes:{
  width: 20,
  height: 20,
  
},

taskTodayName:{
   fontSize: 16, 
   fontFamily: 'Montserrat'
},

taskRow:{
  marginTop:10,
  flexDirection: 'row',
  alignItems:'center',
},  
});
