import React from 'react';
import { MessageSquare, Trophy, Bell, User } from 'lucide-react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <MessageSquare className="brand-icon" size={28} />
            <h1 className="brand-title">Community Feed</h1>
          </div>
          
          <nav className="header-nav">
            <button className="btn btn-ghost" aria-label="Leaderboard">
              <Trophy size={20} />
              <span className="nav-text">Leaderboard</span>
            </button>
            <button className="btn btn-ghost" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <button className="btn btn-ghost" aria-label="Profile">
              <User size={20} />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
