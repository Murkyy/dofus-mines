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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [lastUpdated, setLastUpdated] = useState(null);

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

    // Listen for system dark mode changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  const updateMine = (mineId) => {
    const mineRef = ref(database, `mines/${mineId}`);
    const timestamp = Date.now();
    set(mineRef, timestamp);
    setLastUpdated({ mineId, timestamp });
  };

  const undoLastUpdate = () => {
    if (lastUpdated) {
      const mineRef = ref(database, `mines/${lastUpdated.mineId}`);
      const previousTimestamp = mineStates[lastUpdated.mineId];
      if (previousTimestamp !== lastUpdated.timestamp) return; // Safety check
      remove(mineRef);
      setLastUpdated(null);
    }
  };

  const getTimeStatus = (timestamp) => {
    if (!timestamp) return { text: 'Not visited', color: isDarkMode ? 'bg-gray-800' : 'bg-gray-100' };
    
    const minutesAgo = Math.round((Date.now() - timestamp) / 1000 / 60);
    return { 
      text: `${minutesAgo}m ago`,
      color: minutesAgo > 20 
        ? (isDarkMode ? 'bg-green-900' : 'bg-green-100')
        : (isDarkMode ? 'bg-red-900' : 'bg-red-100')
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
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md mx-auto p-4">
        <div className={`p-4 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dofus Mine Tracker
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-3 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={() => setIsAddingMine(!isAddingMine)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {isAddingMine ? 'Cancel' : 'Add Mine'}
              </button>
            </div>
          </div>

          {lastUpdated && (
            <div className="mb-4">
              <button
                onClick={undoLastUpdate}
                className={`w-full p-2 rounded ${
                  isDarkMode 
                    ? 'bg-yellow-700 text-white hover:bg-yellow-600'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Undo last update
              </button>
            </div>
          )}

          {isAddingMine && (
            <div className={`mb-4 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mine Name"
                  value={newMineName}
                  onChange={(e) => setNewMineName(e.target.value)}
                  className={`flex-1 p-2 border rounded ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white border-gray-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
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
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {mine.name}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {status.text}
                    </div>
                  </button>
                  {mine.id !== 'djlarve' && (
                    <button
                      onClick={() => removeMine(mine.id)}
                      className={`px-3 rounded ${
                        isDarkMode 
                          ? 'bg-red-900 hover:bg-red-800 text-white'
                          : 'bg-red-100 hover:bg-red-200 text-red-800'
                      }`}
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
      </div>
    </div>
  );
}

export default App;