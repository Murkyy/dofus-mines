import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA4rv5W68IQ1ZNUrZ_T1IPQ7D0fua4Uem0",
  authDomain: "dofus-mines.firebaseapp.com",
  databaseURL: "https://dofus-mines-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dofus-mines",
  storageBucket: "dofus-mines.firebasestorage.app",
  messagingSenderId: "1059142628564",
  appId: "1:1059142628564:web:d38b7050eb7cd21e2e7741"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const mines = [
  { id: 'fer', name: 'Fer', respawnTime: 15 },
  { id: 'cuivre', name: 'Cuivre', respawnTime: 15 },
  { id: 'bronze', name: 'Bronze', respawnTime: 15 },
  { id: 'kobalte', name: 'Kobalte', respawnTime: 20 },
  { id: 'etain', name: 'Étain', respawnTime: 20 },
  { id: 'argent', name: 'Argent', respawnTime: 25 },
  { id: 'bauxite', name: 'Bauxite', respawnTime: 25 },
  { id: 'or', name: 'Or', respawnTime: 30 },
];

function App() {
  const [mineStates, setMineStates] = useState({});

  useEffect(() => {
    const minesRef = ref(database, 'mines');
    onValue(minesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setMineStates(data);
    });
  }, []);

  const updateMine = (mineId) => {
    const mineRef = ref(database, `mines/${mineId}`);
    set(mineRef, Date.now());
  };

  const getTimeStatus = (timestamp, respawnTime) => {
    if (!timestamp) return { text: 'Not visited', color: 'bg-gray-100' };
    
    const minutesAgo = (Date.now() - timestamp) / 1000 / 60;
    const timeLeft = respawnTime - minutesAgo;

    if (timeLeft > 5) {
      return { 
        text: `${Math.round(minutesAgo)}m ago (${Math.round(timeLeft)}m left)`,
        color: 'bg-red-100'
      };
    } else if (timeLeft > 0) {
      return { 
        text: `${Math.round(minutesAgo)}m ago (Soon!)`,
        color: 'bg-yellow-100'
      };
    } else {
      return { 
        text: `${Math.round(minutesAgo)}m ago (Ready!)`,
        color: 'bg-green-100'
      };
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Dofus Mine Tracker</h2>
      <div className="grid gap-2">
        {mines.map(mine => {
          const status = getTimeStatus(mineStates[mine.id], mine.respawnTime);
          return (
            <button
              key={mine.id}
              onClick={() => updateMine(mine.id)}
              className={`p-3 rounded ${status.color} hover:opacity-90 transition-opacity text-left`}
            >
              <div className="font-bold">{mine.name}</div>
              <div className="text-sm text-gray-600">{status.text}</div>
            </button>
          )})}
      </div>
    </div>
  );
}

export default App;