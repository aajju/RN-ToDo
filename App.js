import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Fontisto, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const STORAGE_STATE = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
    loadState();
  }, []);
  useEffect(() => {
    saveState(working);
  }, [working]);
  const travel = () => {
    setWorking(false);
  };
  const work = () => {
    setWorking(true);
  };
  const editInputOpen = () => {
    setEditing(true);
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    try {
      const jsonPayload = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonPayload != null ? setToDos(JSON.parse(jsonPayload)) : null;
    } catch (error) {
      console.log(error);
    }
  };

  const saveState = async (working) => {
    await AsyncStorage.setItem(STORAGE_STATE, JSON.stringify(working));
  };

  const loadState = async () => {
    try {
      const jsonPayload = await AsyncStorage.getItem(STORAGE_STATE);
      return jsonPayload != null ? setWorking(JSON.parse(jsonPayload)) : false;
    } catch (error) {
      console.log(error);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  const doneToDo = (key) => {
    const newToDos = {
      ...toDos,
      [key]: {
        text: toDos[key].text,
        working,
        done: toDos[key].done ? false : true,
      },
    };
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const editTodo = async (key) => {
    // setEditing(false);
    if (editText === "") {
      console.log(key.value);
      console.log(key.text);

      return;
    }
    const newToDos = {
      ...toDos,
      [key]: { editText, working, done: toDos[key].done },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <>
              <View style={styles.toDo} key={key}>
                <Text
                  style={
                    toDos[key].done ? styles.toDoTextDone : styles.toDoText
                  }
                >
                  {toDos[key].text}
                </Text>
                <View style={styles.toDoIcon}>
                  <TouchableOpacity
                    key={key + 1}
                    style={styles.toDoIconCols}
                    onPress={() => editInputOpen()}
                  >
                    <Feather name="edit" size={18} color={theme.grey} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    key={key + 2}
                    style={styles.toDoIconCols}
                    onPress={() => doneToDo(key)}
                  >
                    <Fontisto
                      name="checkbox-active"
                      size={18}
                      color={toDos[key].done ? "white" : theme.grey}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    key={key + 3}
                    style={styles.toDoIconCols}
                    onPress={() => deleteToDo(key)}
                  >
                    <Fontisto name="trash" size={18} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              </View>
              {editing ? (
                <TextInput
                  key={key + "textinput"}
                  onSubmitEditing={editTodo(toDos[key])}
                  onChangeText={onChangeEditText}
                  returnKeyType="done"
                  value={editText}
                  style={styles.input}
                />
              ) : null}
            </>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  toDoTextDone: {
    color: theme.grey,
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "line-through",
  },
  toDoIcon: {
    flexDirection: "row",
  },
  toDoIconCols: {
    marginHorizontal: 5,
  },
});
