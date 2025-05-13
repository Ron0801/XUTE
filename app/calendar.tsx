import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { db } from '@/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth } from '@/firebaseConfig';
import CustomNavbar from '@/components/customNavbar';

const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'St'];
const screenWidth = Dimensions.get('window').width;
const daySize = (screenWidth - 132) / 7;

const calendar = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const [tasksForSelectedDay, setTasksForSelectedDay] = React.useState<any[]>([]);
  const [tasksPerDay, setTasksPerDay] = React.useState<{ [key: number]: any[] }>({});

  React.useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
  
    const fetchTasksForMonth = () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
      const tasksQuery = query(
        collection(db, 'users', user.uid, 'tasks'),
        where('dueDateTime', '>=', startOfMonth.toISOString().split('T')[0] + 'T00:00:00.000Z'),
        where('dueDateTime', '<=', endOfMonth.toISOString().split('T')[0] + 'T23:59:59.999Z'),
        orderBy('dueDateTime', 'asc')
      );
  
      const unsubscribe = onSnapshot(tasksQuery, (tasksSnapshot) => {
        const tasksGroupedByDay: { [key: number]: any[] } = {};
        tasksSnapshot.forEach((doc) => {
          const task = { id: doc.id, ...doc.data() };
          const taskDate = new Date(task.dueDateTime);
          const taskDay = taskDate.getDate();

          if (!tasksGroupedByDay[taskDay]) {
            tasksGroupedByDay[taskDay] = [];
          }
          tasksGroupedByDay[taskDay].push(task);
        });

        setTasksPerDay(tasksGroupedByDay);
      });
  
      return unsubscribe;
    };
  
    const unsubscribe = fetchTasksForMonth();
  
    return () => unsubscribe();
  }, [currentDate]);

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysArray = [];

    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      daysArray.push(day);
    }
    const remainingDays = 7 - (daysArray.length % 7);
    for (let i = 0; i < remainingDays && remainingDays !== 7; i++) {
      daysArray.push(null);
    }
    return daysArray;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const days = getDaysInMonth();

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const selectedTasks = tasksPerDay[day] || [];
    setTasksForSelectedDay(selectedTasks);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.row, { paddingBottom: 28 }]}>
        <ThemedText type="big">Calendar</ThemedText>
      </View>

      <View style={styles.monthNavigation}>
        <ThemedButton
          title="<"
          type="outlined"
          style={{ padding: 8, aspectRatio: 1 / 1, width: 36, borderRadius: 9999 }}
          onPress={() => changeMonth(-1)}
        />
        <ThemedText type="title">{`${monthName} ${year}`}</ThemedText>
        <ThemedButton
          title=">"
          type="outlined"
          style={{ padding: 8, aspectRatio: 1 / 1, width: 36, borderRadius: 9999 }}
          onPress={() => changeMonth(1)}
        />
      </View>

      <View style={styles.weekDaysRow}>
        {daysOfWeek.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={index} style={{ width: daySize, height: daySize }} />;
          }

          const isSelected = selectedDay === day;
          const hasTasks = tasksPerDay[day] && tasksPerDay[day].length > 0;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCircle,
                {
                  width: daySize,
                  height: daySize,
                  borderRadius: daySize / 2,
                  borderColor: hasTasks ? '#8075FF' : '#000',
                  borderWidth: hasTasks ? 2 : 1,
                  
                },
                isSelected && styles.selectedDay,
              ]}
              onPress={() => handleDaySelect(day)}
            >
              <ThemedText style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ThemedText type="title">Tasks</ThemedText>
      <View>
        {tasksForSelectedDay.length > 0 ? (
          tasksForSelectedDay.map((task, index) => (
            <View key={task.id} style={styles.taskContainer}>
              <View style={{ borderRightWidth: 1, borderRightColor: '#090809', flex: 0.5 }}>
                <ThemedText>{new Date(task.dueDateTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</ThemedText>
              </View>
              <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <ThemedText>{task.title}</ThemedText>
                <ThemedText style={{ fontSize: 8 }}>Priority: {task.priorityLevel}</ThemedText>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.taskContainer}>
            <ThemedText>No tasks for selected day.</ThemedText>
          </View>
        )}
      </View>
      <CustomNavbar selectedIcon='calendar'/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBEF",
    paddingVertical: 32,
    paddingHorizontal: 18,
    gap: 16,
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
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navArrow: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  monthText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  weekDay: {
    width: daySize,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 10,
    flexWrap: 'wrap',
  },
  dayCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selectedDay: {
    backgroundColor: '#8075ff',
  },
  dayText: {
    color: '#000',
    marginBottom: -2,
  },
  selectedDayText: {
    color: '#FFF',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 2,
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
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  }
});

export default calendar;