import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

const predefinedTags = ['School', 'Personal', 'Work', 'Family', 'Hobby', 'Others'];

const EditTask = () => {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [taskTitle, setTaskTitle] = React.useState('');
  const [dueDate, setDueDate] = React.useState(new Date());
  const [dueTime, setDueTime] = React.useState(new Date());
  const [remindMe, setRemindMe] = React.useState('1 week before');
  const [priorityLevel, setPriorityLevel] = React.useState('Normal');
  const [description, setDescription] = React.useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = React.useState(false);

  const [showDeleteModal, setshowDeleteModal] = React.useState(false);
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");
  

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
    );
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleDateConfirm = (date: Date) => {
    setDueDate(date);
    hideDatePicker();
  };

  const handleTimeConfirm = (time: Date) => {
    setDueTime(time);
    hideTimePicker();
  };

  React.useEffect(() => {
    const fetchTask = async () => {
      const user = auth.currentUser;
      if (!user || !taskId) return;

      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);

      if (taskSnap.exists()) {
        const data = taskSnap.data();
        setTaskTitle(data.title || '');
        setDescription(data.description || '');
        setSelectedTags(data.tags || []);
        setRemindMe(data.remindMe || '1 week before');
        setPriorityLevel(data.priorityLevel || 'Normal');

        const dateTime = new Date(data.dueDateTime);
        setDueDate(dateTime);
        setDueTime(dateTime);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async () => {
    const user = auth.currentUser;
    if (!user || !taskId) return;

    const mergedDueDateTime = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
      dueTime.getHours(),
      dueTime.getMinutes()
    );

    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);

    try {
      await updateDoc(taskRef, {
        title: taskTitle,
        description,
        tags: selectedTags,
        remindMe,
        priorityLevel,
        dueDateTime: mergedDueDateTime.toISOString(),
        updatedAt: new Date().toISOString()
      });
    
      setStatusMessage('Task details updated successfully!'),
      setShowStatusModal(true)
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDeleteTask = async () => {
      const user = auth.currentUser;
      if (!user || !taskId) return;
    
      try {
        const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
        await deleteDoc(taskRef);
    
        setshowDeleteModal(false);
        router.back();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    };

  return (
        <ScrollView contentContainerStyle={styles.container}>
          <View>
            <View style={[styles.row, {alignItems: "center", marginTop: 0}]}>
              <ThemedText type='big' onPress={() => router.back()}>Edit Task</ThemedText>
              <TouchableOpacity onPress={() => setshowDeleteModal(true)}>
                <ThemedText style={{color: "#F40000"}}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
    
            <TextInput
              placeholder="Untitled Task"
              style={styles.inputTitle}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
    
            <View style={styles.row}>
              <View style={styles.col}>
                <ThemedText style={styles.label}>Due Date</ThemedText>
                <TouchableOpacity onPress={showDatePicker}>
                  <ThemedText style={styles.input}>{dueDate.toDateString()}</ThemedText>
                </TouchableOpacity>
    
                <DateTimePicker
                  isVisible={isDatePickerVisible}
                  mode="date"
                  date={dueDate}
                  onConfirm={handleDateConfirm}
                  onCancel={hideDatePicker}
                />
              </View>
    
              <View style={styles.col}>
                <ThemedText style={styles.label}>Time</ThemedText>
                <TouchableOpacity onPress={showTimePicker}>
                  <ThemedText style={styles.input}>
                    {dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                </TouchableOpacity>
    
                <DateTimePicker
                  isVisible={isTimePickerVisible}
                  mode="time"
                  date={dueTime}
                  onConfirm={handleTimeConfirm}
                  onCancel={hideTimePicker}
                />
              </View>
            </View>
    
            <View style={styles.row}>
              <View style={styles.col}>
                <ThemedText style={styles.label}>Remind Me</ThemedText>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={remindMe}
                    onValueChange={(itemValue: React.SetStateAction<string>) => setRemindMe(itemValue)}
                  >
                    <Picker.Item label="1 week before" style={{fontSize: 14}} value="1 week before" />
                    <Picker.Item label="3 days before" style={{fontSize: 14}} value="3 days before" />
                    <Picker.Item label="1 day before" style={{fontSize: 14}} value="1 day before" />
                    <Picker.Item label="Day itself" style={{fontSize: 14}} value="Day itself" />
                  </Picker>
                </View>
              </View>
    
              <View style={styles.col}>
                <ThemedText style={styles.label}>Priority Level</ThemedText>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={priorityLevel}
                    onValueChange={(itemValue: React.SetStateAction<string>) => setPriorityLevel(itemValue)}
                  >
                    <Picker.Item label="High" style={{fontSize: 14}} value="High" />
                    <Picker.Item label="Normal" style={{fontSize: 14}} value="Normal" />
                    <Picker.Item label="Low" style={{fontSize: 14}} value="Low" />
                  </Picker>
                </View>
              </View>
            </View>
    
            <View style={{marginTop: 24,}}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                placeholder="Add description about your task here..."
                style={styles.inputDescription}
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
    
            <ThemedText style={styles.label}>Tags</ThemedText>
            <View style={styles.tagContainer}>
              {predefinedTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag) && styles.tagSelected
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <ThemedText style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected
                  ]}>{tag}</ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.newTag}>
                <ThemedText>+ New Tag</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
    
        <ThemedButton title='Save Changes' type='default' onPress={handleUpdateTask} />
        <Modal visible={showStatusModal} animationType="fade" transparent={true} onRequestClose={() => setShowStatusModal(false)}>
            <View style={modal.modalBackground}>
                <View style={modal.StatusModalContainer}>
                    <ThemedText type="title">Success!</ThemedText>
                    <ThemedText>{statusMessage}</ThemedText>
                    <ThemedButton title="Confirm" type="default" onPress={() => setShowStatusModal(false)} />
                </View>
            </View>
        </Modal>

        <Modal visible={showDeleteModal} animationType="fade" transparent={true} onRequestClose={() => setshowDeleteModal(false)}>
            <View style={modal.modalBackground}>
                <View style={modal.StatusModalContainer}>
                    <ThemedText type="title">Delete Task?</ThemedText>
                    <ThemedText>You are about to delete this task permanently. Please take note that this action cannot be undone.</ThemedText>
                    <ThemedButton title="Confirm" type="default" style={{backgroundColor: "#F40000"}} onPress={handleDeleteTask} />
                </View>
            </View>
        </Modal>
</ScrollView>
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
      backgroundColor: "#F8FBEF",
      padding: 32,
      borderRadius: 10,
      width: 480,
      gap: 24
    },
    StatusModalContainer:{
      backgroundColor: "#F8FBEF",
      padding: 20,
      borderRadius: 10,
      width: 360,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBEF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  inputTitle: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginTop: 16,
    fontFamily: 'Anton'
  },
  label: {
    marginBottom: 4,
    fontFamily: 'Anton'
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
    gap: 16,
    marginTop: 24
  },
  col: {
    flex: 1,
  },
  inputDescription: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 0
  },  
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 16,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  tagSelected: {
    backgroundColor: '#8887f5',
    borderColor: '#8887f5',
  },
  tagText: {
    color: '#333',
  },
  tagTextSelected: {
    color: 'white',
  },
  newTag: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  newTagText: {
    color: '#999',
    fontSize: 16,
  },
});

export default EditTask;


