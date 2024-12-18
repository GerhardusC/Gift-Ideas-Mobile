import React, { useRef } from 'react';
import { StyleSheet, View, Text, FlatList, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

type Gift = {
    ID: number,
    gift: string,
}

export default function GiftIdeasScreen() {
    const [currentGift, setCurrentGift] = useState("");

    const editInputRef = useRef<TextInput>(null);

    const [editingGift, setEditingGift] = useState<number | null>(null);

    const [gifts, setGifts] = useState<Gift[]>([]);
    useEffect(() => {
        (async () => {
            const db = await SQLite.openDatabaseAsync("dev");
            await db.execAsync(`
CREATE TABLE IF NOT EXISTS gifts (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    gift varchar(255)
);                
                `)
            const currentGifts = await db.getAllAsync<Gift>("SELECT * FROM gifts;")
            setGifts(currentGifts);
        })()
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>GIFT IDEAS:</Text>
            <TextInput
                value={currentGift}
                placeholder='Gift name'
                onChangeText={(newText) => {
                    setCurrentGift(newText);
                }}
            />
            <Button
                title='Add Gift'
                onPress={() => {
                    (async () => {
                        if(currentGift !== ""){
                            const db = await SQLite.openDatabaseAsync("dev");
                            const res = await db.runAsync(`
INSERT INTO gifts (gift)
VALUES (?);
                        `, [currentGift])
                            const read = await db.getAllAsync<Gift>("SELECT * FROM gifts");
                            setGifts(read)
                            setCurrentGift("");
                            
                        } else {
                            Alert.alert("No gift content.")
                        }
                    })()
                }}
            />
            <View style={styles.separator} />
            {
                gifts.length > 0 &&
                <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={gifts}
                    renderItem={(item) => {
                        return <View style={styles.listItem}>
                                {
                                    editingGift !== item.item.ID ?
                                    <>
                                        <Text style={styles.colOne}>{item.item.gift}</Text>
                                        <TouchableOpacity
                                            style={styles.editArea}
                                            onPress={() => {
                                                setEditingGift(item.item.ID);
                                                setCurrentGift(item.item.gift);
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
                                            value={currentGift}
                                            autoFocus
                                            onFocus={function () {
                                                if(editInputRef.current){
                                                    editInputRef.current.setSelection(0, item.item.gift.length)
                                                }
                                            }}
                                            placeholder='New gift'
                                            onChangeText={newText => {
                                                setCurrentGift(newText);
                                            }}
                                        />
                                        <View
                                            style={styles.editArea}
                                        >
                                            <Button
                                                title='✅'
                                                color="#eee"
                                                onPress={() => {
                                                    if(currentGift !== ""){
                                                        (async () => {
                                                            const db = await SQLite.openDatabaseAsync("dev");
                                                            const changed = await db.runAsync(`
UPDATE gifts
SET gift = ?
WHERE ID = ?;
                                                                `, [currentGift, item.item.ID])
                                                            const gifts = await db.getAllAsync<Gift>("SELECT * FROM gifts;");
                                                            setGifts(gifts);
                                                            setCurrentGift("");
                                                            setEditingGift(null);
                                                        })()
                                                    } else {
                                                        Alert.alert("No content for gift", "Set the new gift correctly before clicking OK.")
                                                    }
                                                }}
                                            />
                                            <Button
                                                title='❌'
                                                color="#ddd"
                                                onPress={() => {
                                                    setEditingGift(null);
                                                    setCurrentGift("");
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
                                            "Do you really want to delete this gift?",
                                            [
                                                {
                                                    text: "Yes",
                                                    onPress: () => {
                                                        (async () => {
                                                            const db = await SQLite.openDatabaseAsync("dev");
                                                            await db.runAsync("DELETE FROM gifts WHERE ID = (?)", [item.item.ID]);
                                                            const gifts = await db.getAllAsync<Gift>("SELECT ID, gift FROM gifts;");
                                                            setGifts(gifts);
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
