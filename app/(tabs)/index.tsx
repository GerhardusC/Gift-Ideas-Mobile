import React, { useRef } from 'react';
import { StyleSheet, View, Text, FlatList, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

type Todo = {
    ID: number,
    todo: string,
}

export default function GiftIdeasScreen() {
    const [currentTodo, setCurrentTodo] = useState("");

    const editInputRef = useRef<TextInput>(null);

    const [editingTodo, setEditingTodo] = useState<number | null>(null);

    const [todos, setTodos] = useState<Todo[]>([]);
    useEffect(() => {
        (async () => {
            const db = await SQLite.openDatabaseAsync("dev");
            await db.execAsync(`
CREATE TABLE IF NOT EXISTS todos (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    todo varchar(255)
);                
                `)
            const currentTodos = await db.getAllAsync<Todo>("SELECT * FROM todos;")
            setTodos(currentTodos);
        })()
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>GIFT IDEAS:</Text>
            <TextInput
                value={currentTodo}
                placeholder='Gift name'
                onChangeText={(newText) => {
                    setCurrentTodo(newText);
                }}
            />
            <Button
                title='Add Gift'
                onPress={() => {
                    (async () => {
                        if(currentTodo !== ""){
                            const db = await SQLite.openDatabaseAsync("dev");
                            const res = await db.runAsync(`
INSERT INTO todos (todo)
VALUES (?);
                        `, [currentTodo])
                            console.log("Rows changed:", res.changes);
                            const read = await db.getAllAsync<Todo>("SELECT * FROM todos");
                            setTodos(read)
                            setCurrentTodo("");
                            
                        } else {
                            Alert.alert("No todo content.")
                        }
                    })()
                }}
            />
            <View style={styles.separator} />
            {
                todos.length > 0 &&
                <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={todos}
                    renderItem={(item) => {
                        return <View style={styles.listItem}>
                                {
                                    editingTodo !== item.item.ID ?
                                    <>
                                        <Text style={styles.colOne}>{item.item.todo}</Text>
                                        <TouchableOpacity
                                            style={styles.editArea}
                                            onPress={() => {
                                                setEditingTodo(item.item.ID);
                                                setCurrentTodo(item.item.todo);
                                            }}
                                        >
                                            <Text style={styles.editButton}>Edit</Text>
                                        </TouchableOpacity>
                                    </>
                                    :
                                    <>
                                        <TextInput
                                            style={styles.colOne}
                                            ref={editInputRef}
                                            value={currentTodo}
                                            autoFocus
                                            onFocus={function () {
                                                if(editInputRef.current){
                                                    editInputRef.current.setSelection(0, item.item.todo.length)
                                                }
                                            }}
                                            placeholder='New todo'
                                            onChangeText={newText => {
                                                setCurrentTodo(newText);
                                            }}
                                        />
                                        <View
                                            style={styles.editArea}
                                        >
                                            <Button
                                                title='✅'
                                                color="#eee"
                                                onPress={() => {
                                                    if(currentTodo !== ""){
                                                        (async () => {
                                                            const db = await SQLite.openDatabaseAsync("dev");
                                                            const changed = await db.runAsync(`
UPDATE todos
SET todo = ?
WHERE ID = ?;
                                                                `, [currentTodo, item.item.ID])
                                                            console.log(changed.changes)
                                                            const todos = await db.getAllAsync<Todo>("SELECT * FROM todos;");
                                                            setTodos(todos);
                                                            setCurrentTodo("");
                                                            setEditingTodo(null);
                                                        })()
                                                    } else {
                                                        Alert.alert("No content for todo", "Set the new todo correctly before clicking OK.")
                                                    }
                                                }}
                                            />
                                            <Button
                                                title='❌'
                                                color="#ddd"
                                                onPress={() => {
                                                    setEditingTodo(null);
                                                    setCurrentTodo("");
                                                }}
                                            />
                                        </View>
                                    </>
                                }
                                <TouchableOpacity
                                    style={styles.deleteArea}
                                    onPress={() => {
                                        Alert.alert(
                                            "Are you sure?",
                                            "Do you really want to delete this todo?",
                                            [
                                                {
                                                    text: "Yes",
                                                    onPress: () => {
                                                        (async () => {
                                                            const db = await SQLite.openDatabaseAsync("dev");
                                                            await db.runAsync("DELETE FROM todos WHERE ID = (?)", [item.item.ID]);
                                                            const todos = await db.getAllAsync<Todo>("SELECT ID, todo FROM todos");
                                                            setTodos(todos);
                                                        })()
                                                    }
                                                },
                                                {
                                                    text: "No",
                                                    onPress: () => {
                                                        console.log("Not deleted...")
                                                    }
                                                },
                                            ]
                                        )
                                    }}
                                >
                                    <Text
                                        style={styles.deleteButton}
                                    >Delete</Text>
                                </TouchableOpacity>
                            </View>
                    }}
                />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 10,
        height: 1,
    },
    listItem: {
        flex: 0,
        justifyContent: "flex-end",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
    },
    listContainer: {
        gap: 10,
        backgroundColor: "#ccc",
        borderRadius: 15,
        padding: 20,
    },
    colOne: {
        width: "50%"
    },
    editArea: {
        flex: 0,
        flexDirection: "row",
        width: "20%",
        gap: 5,
    },
    deleteArea: {
        width: "20%"
    },
    editButton: {
        flex: 2,
        backgroundColor: "green",
        textAlign: "center",
        padding: 5,
        color: "#eee",
    },
    deleteButton: {
        backgroundColor: "#a32",
        padding: 5,
        textAlign: "center",
        color: "#eee"
    }
});
