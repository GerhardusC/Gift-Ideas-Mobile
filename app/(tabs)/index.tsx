import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Button, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

type Todo = {
    ID: number,
    todo: string,
}

export default function TabOneScreen() {
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
            <Text style={styles.title}>To-Do list</Text>
            <TextInput
                value={currentTodo}
                placeholder='Todo content'
                onChangeText={(newText) => {
                    setCurrentTodo(newText);
                }}
            />
            <Button
                title='Add todo'
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
                            alert("No todo content.")
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
                                        <Text>{item.item.todo}</Text>
                                        <Button
                                            title='Edit'
                                            color="#2a3"
                                            onPress={() => {
                                                setEditingTodo(item.item.ID);
                                                setCurrentTodo(item.item.todo);
                                            }}
                                        />
                                    </>
                                    :
                                    <>
                                        <TextInput
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
                                        <Button
                                            title='Confirm'
                                            color="#990"
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
                                                    alert("No current todo.")
                                                }
                                            }}
                                        />
                                        <Button
                                            title='Cancel'
                                            color="#909"
                                            onPress={() => {
                                                setEditingTodo(null);
                                                setCurrentTodo("");
                                            }}
                                        />
                                    </>
                                }
                                <Button
                                    title='Delete'
                                    onPress={() => {
                                        (async () => {
                                            const db = await SQLite.openDatabaseAsync("dev");
                                            await db.runAsync("DELETE FROM todos WHERE ID = (?)", [item.item.ID]);
                                            const todos = await db.getAllAsync<Todo>("SELECT ID, todo FROM todos");
                                            setTodos(todos);
                                        })()
                                    }}
                                />
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
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    listItem: {
        flex: 2,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
    },
    listContainer: {
        gap: 10,
        backgroundColor: "#ccc",
        borderRadius: 15,
        padding: 20,
    }
});
