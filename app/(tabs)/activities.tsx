import React, { useState, useEffect, useRef } from 'react';
import * as SQLite from 'expo-sqlite';
import { StyleSheet, View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native';

type Activity = {
    ID: number,
    activity: string,
}

export default function ActivitiesScreen() {
    const [currentActivity, setCurrentActivity] = useState("");

    const editInputRef = useRef<TextInput>(null);

    const [editingActivity, setEditingActivity] = useState<number | null>(null);

    const [activities, setActivities] = useState<Activity[]>([]);
    useEffect(() => {
        (async () => {
            const db = await SQLite.openDatabaseAsync("activities");
            await db.execAsync(`
CREATE TABLE IF NOT EXISTS activities (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    activity varchar(255)
);                
                `)
            const currentActivities = await db.getAllAsync<Activity>("SELECT * FROM activities;")
            setActivities(currentActivities);
        })()
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ACTIVITY IDEAS:</Text>
            <TextInput
                value={currentActivity}
                placeholder='Activity name'
                onChangeText={(newText) => {
                    setCurrentActivity(newText);
                }}
            />
            <Button
                title='Add activity'
                onPress={() => {
                    (async () => {
                        if(currentActivity !== ""){
                            const db = await SQLite.openDatabaseAsync("activities");
                            const res = await db.runAsync(`
INSERT INTO activities (activity)
VALUES (?);
                        `, [currentActivity])
                            const read = await db.getAllAsync<Activity>("SELECT * FROM activities");
                            setActivities(read)
                            setCurrentActivity("");
                            
                        } else {
                            Alert.alert("No activity content.")
                        }
                    })()
                }}
            />
            <View style={styles.separator} />
            {
                activities.length > 0 &&
                <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={activities}
                    renderItem={(item) => {
                        return <View style={styles.listItem}>
                                {
                                    editingActivity !== item.item.ID ?
                                    <>
                                        <Text style={styles.colOne}>{item.item.activity}</Text>
                                        <TouchableOpacity
                                            style={styles.editArea}
                                            onPress={() => {
                                                setEditingActivity(item.item.ID);
                                                setCurrentActivity(item.item.activity);
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
                                            value={currentActivity}
                                            autoFocus
                                            onFocus={function () {
                                                if(editInputRef.current){
                                                    editInputRef.current.setSelection(0, item.item.activity.length)
                                                }
                                            }}
                                            placeholder='New activity'
                                            onChangeText={newText => {
                                                setCurrentActivity(newText);
                                            }}
                                        />
                                        <View
                                            style={styles.editArea}
                                        >
                                            <Button
                                                title='✅'
                                                color="#eee"
                                                onPress={() => {
                                                    if(currentActivity !== ""){
                                                        (async () => {
                                                            const db = await SQLite.openDatabaseAsync("activities");
                                                            const changed = await db.runAsync(`
UPDATE activities
SET activity = ?
WHERE ID = ?;
                                                                `, [currentActivity, item.item.ID])
                                                            const activities = await db.getAllAsync<Activity>("SELECT * FROM activities;");
                                                            setActivities(activities);
                                                            setCurrentActivity("");
                                                            setEditingActivity(null);
                                                        })()
                                                    } else {
                                                        Alert.alert("No content for activity", "Set the new activity correctly before clicking OK.")
                                                    }
                                                }}
                                            />
                                            <Button
                                                title='❌'
                                                color="#ddd"
                                                onPress={() => {
                                                    setEditingActivity(null);
                                                    setCurrentActivity("");
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
                                            "Do you really want to delete this activity?",
                                            [
                                                {
                                                    text: "Yes",
                                                    onPress: () => {
                                                        (async () => {
                                                            const db = await SQLite.openDatabaseAsync("activities");
                                                            await db.runAsync("DELETE FROM activities WHERE ID = (?)", [item.item.ID]);
                                                            const activities = await db.getAllAsync<Activity>("SELECT ID, activity FROM activities");
                                                            setActivities(activities);
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

