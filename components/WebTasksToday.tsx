import React from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Checkbox from 'expo-checkbox';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

const WebTasksToday = () => {
  const [userName, setUserName] = React.useState('');
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [todayTasks, setTodayTasks] = React.useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = React.useState<any[]>([]);

  React.useEffect(() => {
    const user = auth.currentUser;
  
    if (!user) return;
  
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users', user.uid, 'tasks'),
        orderBy('dueDateTime', 'asc')
      ),
      (querySnapshot) => {
        const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(fetchedTasks);
        separateTasks(fetchedTasks);
      }
    );
  
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const user = auth.currentUser;
  
    if (!user) return;
  
    const userDocRef = doc(db, 'users', user.uid);
  
    const unsubscribe = onSnapshot(userDocRef, (userDocSnap) => {
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserName(userData.firstName || '');
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  
  const separateTasks = (fetchedTasks: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const todayTasks = fetchedTasks.filter(task => {
      if (!task.dueDateTime) return false;
  
      const taskDate = new Date(task.dueDateTime);
      taskDate.setHours(0, 0, 0, 0);
  
      return taskDate.getTime() === today.getTime();
    });
  
    const upcomingTasks = fetchedTasks.filter(task => {
      if (!task.dueDateTime) return false;
  
      const taskDate = new Date(task.dueDateTime);
      taskDate.setHours(0, 0, 0, 0);
  
      return taskDate.getTime() > today.getTime();
    });
  
    setTodayTasks(todayTasks);
    setUpcomingTasks(upcomingTasks);
  };  

  const { stopPomodoro } = useLocalSearchParams();
  const userId = auth.currentUser?.uid;
  
  React.useEffect(() => {
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

  return (
    <View>
      <View style={{gap: 8}}>
        <View style={styles.row}>
          <ThemedText type='title'>Tasks for Today</ThemedText>
        </View>

        <View>
        {todayTasks.length > 0 ? (
          todayTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Checkbox
                value={task.completed || false}
                onValueChange={async (newValue) => {
                  const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', task.id);
                  
                  await updateDoc(taskRef, {
                    completed: newValue,
                  });

                  setTodayTasks((prevTasks) =>
                    prevTasks.map((t) =>
                      t.id === task.id ? { ...t, completed: newValue } : t
                    )
                  );
                }}
                color={task.completed ? '#8075ff' : undefined}
              />
              <ThemedText>{task.title}</ThemedText>
            </View>
          ))
        ) : (
          <View style={styles.innerContainer}>
            <ThemedText type='subtitle' style={{ fontSize: 20 }}>
              No tasks for today
            </ThemedText>
            <ThemedText type='default' style={{ textAlign: 'center' }}>
              Resting well, {userName}? Add new task whenever you're ready!
            </ThemedText>
          </View>
        )}

        </View>
      </View>

      <View style={{gap: 8, marginTop: 16}}>
        <View style={styles.row}>
          <ThemedText type='title'>Upcoming Tasks</ThemedText>
        </View>

        <View>
          {upcomingTasks.length > 0 ? (
upcomingTasks.map((task, index) => (
            <View
              key={task.id}
              style={[
                styles.taskContainer,
                index === 0 && { backgroundColor: '#090809' }
              ]}
            >
              <TouchableOpacity 
                onPress={() => router.push({ pathname: "/EditTask", params: { taskId: task.id } })}
                style={{
                  borderRightWidth: 1, 
                  borderRightColor: index === 0 ? '#F8FBEF' : '#090809', 
                  flex: 0.6
                }}
              >
                <ThemedText style={index === 0 ? {color:'#F8FFE5'} : undefined}>
                  {new Date(task.dueDateTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push({ pathname: "/EditTask", params: { taskId: task.id } })}
                style={{flex: 1, paddingHorizontal: 16}}
              >
                <ThemedText style={index === 0 ? {color:'#F8FFE5'} : undefined}>
                  {task.title}
                </ThemedText>
                <ThemedText style={[{fontSize: 8}, index === 0 && {color:'#F8FFE5'}]}>
                  Priority: {task.priorityLevel}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))
          ) : (
            <View style={styles.innerContainer}>
              <ThemedText type='subtitle' style={{fontSize: 20}}>No scheduled tasks</ThemedText>
              <ThemedText type='default' style={{textAlign: 'center'}}>Well done! Rest for now, {userName}. </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBEF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 16,
  },
  innerContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 48,
    gap: 16,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: '#ccc',
    marginTop: 16
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
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  }
});

export default WebTasksToday;