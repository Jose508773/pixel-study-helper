import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@pixel_study_helper:tasks';
const FLASHCARDS_STORAGE_KEY = '@pixel_study_helper:flashcards';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [flashcards, setFlashcards] = useState([
    { id: 1, q: 'What is the powerhouse of the cell?', a: 'The Mitochondria' },
    { id: 2, q: 'What does HTML stand for?', a: 'HyperText Markup Language' },
    { id: 3, q: 'What is 2 + 2?', a: '4' }
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Flashcard management states
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardQuestion, setFlashcardQuestion] = useState('');
  const [flashcardAnswer, setFlashcardAnswer] = useState('');
  const [editingFlashcardId, setEditingFlashcardId] = useState(null);

  // Load tasks and flashcards from storage on mount
  useEffect(() => {
    Promise.all([loadTasks(), loadFlashcards()]).then(() => {
      setIsInitialLoad(false);
    });
  }, []);

  // Save tasks to storage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      const timer = setTimeout(() => {
        saveTasks();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // Save flashcards to storage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      const timer = setTimeout(() => {
        saveFlashcards();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashcards]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const loadFlashcards = async () => {
    try {
      const storedFlashcards = await AsyncStorage.getItem(FLASHCARDS_STORAGE_KEY);
      if (storedFlashcards !== null) {
        const parsed = JSON.parse(storedFlashcards);
        setFlashcards(parsed);
        // Ensure currentCardIndex is valid
        if (parsed.length > 0 && currentCardIndex >= parsed.length) {
          setCurrentCardIndex(0);
        }
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  const saveFlashcards = async () => {
    try {
      await AsyncStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(flashcards));
    } catch (error) {
      console.error('Error saving flashcards:', error);
    }
  };

  const addTask = () => {
    const taskText = taskInput.trim();
    if (taskText === '') {
      showPixelMessage('Error', 'Task cannot be empty!');
      return;
    }
    setTasks([{ id: Date.now(), text: taskText, completed: false }, ...tasks]);
    setTaskInput('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex((currentCardIndex + 1) % flashcards.length);
      setIsFlipped(false);
    }
  };

  const showPixelMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const openFlashcardModal = (flashcard = null) => {
    if (flashcard) {
      setEditingFlashcardId(flashcard.id);
      setFlashcardQuestion(flashcard.q);
      setFlashcardAnswer(flashcard.a);
    } else {
      setEditingFlashcardId(null);
      setFlashcardQuestion('');
      setFlashcardAnswer('');
    }
    setShowFlashcardModal(true);
  };

  const closeFlashcardModal = () => {
    setShowFlashcardModal(false);
    setEditingFlashcardId(null);
    setFlashcardQuestion('');
    setFlashcardAnswer('');
  };

  const saveFlashcard = () => {
    const question = flashcardQuestion.trim();
    const answer = flashcardAnswer.trim();

    if (question === '' || answer === '') {
      showPixelMessage('Error', 'Both question and answer are required!');
      return;
    }

    if (editingFlashcardId) {
      // Edit existing flashcard
      setFlashcards(flashcards.map(card =>
        card.id === editingFlashcardId
          ? { ...card, q: question, a: answer }
          : card
      ));
    } else {
      // Add new flashcard
      const newCard = {
        id: Date.now(),
        q: question,
        a: answer
      };
      setFlashcards([...flashcards, newCard]);
      // If this is the first card, set it as current
      if (flashcards.length === 0) {
        setCurrentCardIndex(0);
      }
    }
    closeFlashcardModal();
  };

  const deleteFlashcard = (id) => {
    if (flashcards.length <= 1) {
      showPixelMessage('Error', 'You must have at least one flashcard!');
      return;
    }
    const newFlashcards = flashcards.filter(card => card.id !== id);
    setFlashcards(newFlashcards);
    // Adjust current index if needed
    if (currentCardIndex >= newFlashcards.length) {
      setCurrentCardIndex(Math.max(0, newFlashcards.length - 1));
    }
    setIsFlipped(false);
  };

  const currentCard = flashcards.length > 0 ? flashcards[currentCardIndex] : null;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>[ Pixel Study Hub ]</Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Widget 1: To-Do List */}
        <View style={styles.pixelWindow}>
          <View style={styles.pixelTitleBar}>
            <Text style={styles.titleBarText}>[ TASKS ]</Text>
          </View>
          <View style={styles.windowContent}>
            <View style={styles.taskForm}>
              <TextInput
                style={styles.pixelInput}
                placeholder="New quest..."
                placeholderTextColor="#666"
                value={taskInput}
                onChangeText={setTaskInput}
                onSubmitEditing={addTask}
              />
              <TouchableOpacity style={[styles.btnPixel, styles.btnGreen]} onPress={addTask}>
                <Text style={styles.btnText}>ADD</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.taskList} nestedScrollEnabled>
              {tasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => toggleTask(task.id)}
                >
                  <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
                    {task.text}
                  </Text>
                  <TouchableOpacity
                    style={[styles.btnPixel, styles.btnRed, styles.deleteBtn]}
                    onPress={() => deleteTask(task.id)}
                  >
                    <Text style={styles.deleteBtnText}>DEL</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Widget 2: Flashcards */}
        <View style={styles.pixelWindow}>
          <View style={styles.pixelTitleBar}>
            <Text style={styles.titleBarText}>[ FLASHCARDS ]</Text>
            <TouchableOpacity onPress={() => openFlashcardModal()}>
              <Text style={styles.addButtonText}>+ ADD</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.windowContent}>
            {flashcards.length === 0 ? (
              <View style={styles.emptyFlashcardContainer}>
                <Text style={styles.emptyFlashcardText}>No flashcards yet!</Text>
                <Text style={styles.emptyFlashcardSubtext}>Tap "+ ADD" to create one</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.flashcardContainer}
                  onPress={flipCard}
                  activeOpacity={0.8}
                >
                  <Text style={styles.flashcardText}>
                    {isFlipped ? currentCard.a : currentCard.q}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.cardCounter}>
                  Card {currentCardIndex + 1} / {flashcards.length}
                </Text>
                <View style={styles.flashcardControls}>
                  <TouchableOpacity style={styles.btnPixel} onPress={flipCard}>
                    <Text style={styles.btnText}>FLIP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnPixel} onPress={nextCard}>
                    <Text style={styles.btnText}>NEXT</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.flashcardManageButtons}>
                  <TouchableOpacity 
                    style={[styles.btnPixel, styles.btnGreen, styles.manageBtn]}
                    onPress={() => openFlashcardModal(currentCard)}
                  >
                    <Text style={styles.btnText}>EDIT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btnPixel, styles.btnRed, styles.manageBtn]}
                    onPress={() => deleteFlashcard(currentCard.id)}
                  >
                    <Text style={styles.btnText}>DELETE</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Widget 3: Resources */}
        <View style={styles.pixelWindow}>
          <View style={styles.pixelTitleBar}>
            <Text style={styles.titleBarText}>[ RESOURCES ]</Text>
          </View>
          <View style={styles.windowContent}>
            <ScrollView style={styles.resourcesList} nestedScrollEnabled>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceLink}>› Study Guide</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceLink}>› Math Formulas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceLink}>› History Notes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceLink}>› Science Portal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceLink}>› Pomodoro Timer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceItem}>
                <Text style={styles.resourceLink}>› Lofi Beats</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Created with 💾 and 💡</Text>
        </View>
      </ScrollView>

      {/* Modal for messages */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pixelWindow}>
            <View style={styles.pixelTitleBar}>
              <Text style={styles.titleBarText}>[ {modalTitle} ]</Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity 
                style={styles.btnPixel} 
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.btnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for creating/editing flashcards */}
      <Modal
        visible={showFlashcardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFlashcardModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pixelWindow, styles.flashcardModalWindow]}>
            <View style={styles.pixelTitleBar}>
              <Text style={styles.titleBarText}>
                [ {editingFlashcardId ? 'EDIT CARD' : 'NEW CARD'} ]
              </Text>
            </View>
            <View style={styles.flashcardModalContent}>
              <Text style={styles.flashcardModalLabel}>Question:</Text>
              <TextInput
                style={[styles.pixelInput, styles.flashcardInput]}
                placeholder="Enter question..."
                placeholderTextColor="#666"
                value={flashcardQuestion}
                onChangeText={setFlashcardQuestion}
                multiline
              />
              <Text style={[styles.flashcardModalLabel, { marginTop: 16 }]}>Answer:</Text>
              <TextInput
                style={[styles.pixelInput, styles.flashcardInput]}
                placeholder="Enter answer..."
                placeholderTextColor="#666"
                value={flashcardAnswer}
                onChangeText={setFlashcardAnswer}
                multiline
              />
              <View style={styles.flashcardModalButtons}>
                <TouchableOpacity 
                  style={[styles.btnPixel, styles.btnRed, styles.modalButton]}
                  onPress={closeFlashcardModal}
                >
                  <Text style={styles.btnText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btnPixel, styles.btnGreen, styles.modalButton]}
                  onPress={saveFlashcard}
                >
                  <Text style={styles.btnText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#003366',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  pixelWindow: {
    backgroundColor: '#c0c0c0',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#404040',
    borderBottomColor: '#404040',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 5,
  },
  pixelTitleBar: {
    backgroundColor: '#000080',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 14,
  },
  windowContent: {
    padding: 16,
  },
  taskForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pixelInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderTopColor: '#404040',
    borderLeftColor: '#404040',
    borderRightColor: '#ffffff',
    borderBottomColor: '#ffffff',
    padding: 8,
    fontSize: 16,
  },
  btnPixel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#c0c0c0',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#404040',
    borderBottomColor: '#404040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGreen: {
    backgroundColor: '#90EE90',
  },
  btnRed: {
    backgroundColor: '#F08080',
  },
  btnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskList: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#404040',
    borderLeftColor: '#404040',
    padding: 8,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginRight: 8,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#808080',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 50,
  },
  deleteBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  flashcardContainer: {
    height: 200,
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#404040',
    borderLeftColor: '#404040',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcardText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000',
  },
  cardCounter: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#333',
    fontSize: 14,
  },
  flashcardControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resourcesList: {
    maxHeight: 300,
  },
  resourceItem: {
    marginBottom: 12,
  },
  resourceLink: {
    color: '#000080',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  emptyFlashcardContainer: {
    height: 200,
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#404040',
    borderLeftColor: '#404040',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFlashcardText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyFlashcardSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
  },
  flashcardManageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  manageBtn: {
    flex: 1,
  },
  flashcardModalWindow: {
    maxWidth: 400,
    width: '90%',
  },
  flashcardModalContent: {
    padding: 20,
  },
  flashcardModalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  flashcardInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  flashcardModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 8,
  },
  modalButton: {
    flex: 1,
  },
});

