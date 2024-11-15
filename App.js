import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Load tasks from AsyncStorage when the app loads
  useEffect(() => {
    loadTasks();
  }, []);

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (error) {
      console.error(error);
    }
  };

  // Save tasks to AsyncStorage
  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error(error);
    }
  };

  // Add a new task
  const addTask = () => {
    if (task.trim() === '') {
      Alert.alert('Task cannot be empty');
      return;
    }
    const newTask = { id: Date.now().toString(), task };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setTask('');
  };

  // Open the edit modal
  const openEditModal = (id, taskText) => {
    setEditTaskId(id);
    setEditTaskText(taskText);
    setModalVisible(true);
  };

  // Save changes made to an existing task
  const saveEditTask = () => {
    const updatedTasks = tasks.map(item =>
      item.id === editTaskId ? { ...item, task: editTaskText } : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setModalVisible(false);
    setEditTaskId(null);
    setEditTaskText('');
  };

  // Delete a task
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(item => item.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Render each task item with edit and delete options
  const renderItem = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskText}>{item.task}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item.id, item.task)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButtonText} onPress={() => deleteTask(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={task}
        onChangeText={setTask}
      />
      <Button title="Add Task" onPress={addTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Modal for editing a task */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Update task"
              value={editTaskText}
              onChangeText={setEditTaskText}
            />
            <Button title="Save Changes" onPress={saveEditTask} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  input: {  borderWidth: 1, padding: 10,marginBottom: 20,marginTop: 40,borderColor:"#ccc",borderRadius:10,fontSize: 18},
  taskContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  taskText: { fontSize: 16 },
  buttonContainer: { flexDirection: 'row' },
  editButton: { marginRight: 10 },
  editButtonText: { color: 'blue' },
  deleteButtonText: { color: 'red' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, marginBottom: 8 },
});
