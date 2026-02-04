import React from 'react';
import Header from './components/Header';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="layout">
            <div className="feed-section">
              <Feed />
            </div>
            <aside className="sidebar">
              <Leaderboard />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
