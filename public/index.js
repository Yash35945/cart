import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js';
import {  getDatabase, ref, push, onValue, remove, set,query, orderByChild, equalTo  } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js';

const appSettings = {
    databaseURL: "https://contactapp-f8ae4-default-rtdb.firebaseio.com/",
}
const firebaseApp = initializeApp(appSettings);
const database = getDatabase(firebaseApp);
const itemsRef = ref(database, 'items');

const addButton = document.getElementById('add-button');
const inputField = document.getElementById('input-field');
const updateButton = document.getElementById('update-button');
const updateNameField = document.getElementById('update-key-field'); // Corrected field name
const updateValueField = document.getElementById('update-value-field');
const deleteButton = document.getElementById('delete-button');
const deleteNameField = document.getElementById('delete-key-field');
//const lists = document.getElementById('lists');

//https://cart-ten-sigma.vercel.app/

// Create operation - Add item to database
function addItem(item) {
    push(itemsRef, item);
}

// Read items from database
function getItems() {
    onValue(itemsRef, function(snapshot) {
        clear();
        snapshot.forEach(function(childSnapshot) {
            const key = childSnapshot.key;
            const value = childSnapshot.val();
            insertData(key, value);
        });
    });
}

// Update item in the database using item name
function updateItem(name, newValue) {
    const itemsQuery = query(itemsRef, orderByChild('name'), equalTo(name));
    onValue(itemsQuery, function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const key = childSnapshot.key;
            const itemRefToUpdate = ref(database, `items/${key}`);
            set(itemRefToUpdate, { name : newValue, value: newValue }).then(() => {
                // Update the UI immediately after updating the item in the database
                const updatedItem = { name : newValue, value: newValue };
                updateUI(key, updatedItem);
            }).catch(error => {
                console.error("Error updating item: ", error);
            });
        });
    });
}

// Remove item from the database using item name
function deleteItem(name) {
    const itemsQuery = query(itemsRef, orderByChild('name'), equalTo(name));
    onValue(itemsQuery, function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const key = childSnapshot.key;
            const itemRefToDelete = ref(database, `items/${key}`);
            remove(itemRefToDelete);
        });
    });
}

function updateUI(key, updatedItem) {
    const listItem = document.getElementById(key);
    if (listItem) {
        // Update the list item with the new value
        listItem.innerHTML = updatedItem.name;
    }
}

// Clear the list
function clear() {
    lists.innerHTML = '';
}

// Insert data into the list
function insertData(key, value) {
    const li = document.createElement('li');
    li.innerHTML = value.name;
    li.addEventListener('click', function() {
        deleteItem(value.name);
    });
    lists.appendChild(li);
}

addButton.addEventListener('click', function() {
    const item = { name: inputField.value, value: inputField.value };
    addItem(item);
    inputField.value = '';
});

updateButton.addEventListener('click', function() {
    const name = updateNameField.value;
    const newValue = updateValueField.value;
    updateItem(name, newValue);
    updateNameField.value = '';
    updateValueField.value = '';
});

deleteButton.addEventListener('click', function() {
    const name = deleteNameField.value;
    deleteItem(name);
    deleteNameField.value = '';
});

// Listen for keypress event on the input field
inputField.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        // Add the item
        const itemName = inputField.value.trim();
        if (itemName !== '') {
            const item = { name: itemName, value: itemName };
            addItem(item);
            inputField.value = ''; // Clear the input field
        }
    }
});

// Initial load of items from the database
getItems();
