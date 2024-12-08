import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';

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

function App() {
  const [mineStates, setMineStates] = useState({});
  const [mines, setMines] = useState([
    { id: 'djlarve', name: 'DJ Larve' }
  ]);
  const [newMineName, setNewMineName] = useState('');
  const [isAddingMine, setIsAddingMine] = useState(false);

  useEffect(() => {
    const minesRef = ref(database, 'mines');
    const mineListRef = ref(database, 'mineList');
    
    onValue(minesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setMineStates(data);
    });

    onValue(mineListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMines(data);
    });
  }, []);

  const updateMine = (mineId) => {
    const mineRef = ref(database, `mines/${mineId}`);
    set(mineRef, Date.now());
  };

  const getTimeStatus = (timestamp) => {
    if (!timestamp) return { text: 'Not visited', color: 'bg-gray-100' };
    
    const minutesAgo = Math.round((Date.now() - timestamp) / 1000 / 60);
    return { 
      text: `${minutesAgo}m ago`,
      color: minutesAgo > 20 ? 'bg-green-100' : 'bg-red-100'
    };
  };

  const addMine = () => {
    if (!newMineName.trim()) return;
    
    const newMineData = {
      id: newMineName.toLowerCase().replace(/\s+/g, ''),
      name: newMineName.trim()
    };

    const updatedMines = [...mines, newMineData];
    const mineListRef = ref(database, 'mineList');
    set(mineListRef, updatedMines);
    
    setNewMineName('');
    setIsAddingMine(false);
  };

  const removeMine = (mineId) => {
    const updatedMines = mines.filter(mine => mine.id !== mineId);
    const mineListRef = ref(database, 'mineList');
    const mineStateRef = ref(database, `mines/${mineId}`);
    
    set(mineListRef, updatedMines);
    remove(mineStateRef);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Dofus Mine Tracker</h2>
        <button 
          onClick={() => setIsAddingMine(!isAddingMine)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAddingMine ? 'Cancel' : 'Add Mine'}
        </button>
      </div>

      {isAddingMine && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mine Name"
              value={newMineName}
              onChange={(e) => setNewMineName(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addMine}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {mines.map(mine => {
          const status = getTimeStatus(mineStates[mine.id]);
          return (
            <div key={mine.id} className="flex gap-2">
              <button
                onClick={() => updateMine(mine.id)}
                className={`flex-1 p-3 rounded ${status.color} hover:opacity-90 transition-opacity text-left`}
              >
                <div className="font-bold">{mine.name}</div>
                <div className="text-sm text-gray-600">{status.text}</div>
              </button>
              {mine.id !== 'djlarve' && (
                <button
                  onClick={() => removeMine(mine.id)}
                  className="px-3 bg-red-100 rounded hover:bg-red-200"
                  title="Remove mine"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;