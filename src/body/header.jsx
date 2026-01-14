import { useState, useEffect, useRef } from 'react';
import { Search, Plus, LogOut, X } from 'lucide-react';
import '../CSSF/header.css';
import RedditStyleLayout from './content';
import { useNavigate, Link } from 'react-router-dom';

export default function Header({
  searchQuery,
  setSearchQuery,
  searchByTitle,
  setSearchByTitle,
  triggerSearch,
  setTriggerSearch,
  settop,
  top
}) {

  const navigate = useNavigate();
  const navigate2 = useNavigate();

  const [triggerSearch2, setTriggerSearch2] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [focused, setfocused] = useState(false);

  const gotopfp = () => {
    navigate('Profilepage');
  }

  const gotopost = () => {
    navigate2('Post');
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setTriggerSearch(prev => !prev);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    localStorage.removeItem("username");
    navigate("/", { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const username = localStorage.getItem("username");
  const [finalimg, setfinalimg] = useState('/user.png');
  const [i, seti] = useState(false);

  useEffect(() => {
    async function load2() {
      const res2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/read/get-pfp?iusername=${username}&username=${username}`);
      const data2 = await res2.json();

      if (data2.image) {
        setfinalimg(data2.image);
        seti(true)
      }
    }

    load2();
  }, []);

  const dowork = () => {
    settop(false);
    window.location.reload()
  }

  const handleSearchFocus = () => {
    setfocused(true);
  }

  const handleSearchBlur = () => {
    // Use setTimeout to allow for button clicks before hiding
    setTimeout(() => {
      setfocused(false);
    }, 150);
  }

  const handleClearSearch = () => {
    setSearchQuery('');
    setfocused(false);
    setTriggerSearch(prev => !prev);
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="logo-section">
            <div className="logo">
              <Link to={`/user/${username}`} style={{ textDecoration: "none", color: "inherit" }} onClick={() => { dowork() }}>
                <img src="/logo-fr2.png" alt="" />
              </Link>
            </div>
            <h1 className="app-name">
              <Link to={`/user/${username}`} style={{ textDecoration: "none", color: "inherit" }} onClick={() => { dowork() }}>
                <img src="/txtlogo.png" alt="" />
              </Link>
            </h1>
          </div>

          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder={searchByTitle ? "Search posts by title" : "Search posts by username"}
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />

              <div className="search-icon">
                <Search size={18} />
              </div>

              {searchQuery && (
                <div className="clear-icon" onClick={handleClearSearch}>
                  <X size={18} />
                </div>
              )}
            </div>

            {focused && (
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${searchByTitle ? 'active' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSearchByTitle(true)}
                >
                  Title
                </button>
                <button
                  className={`filter-btn ${!searchByTitle ? 'active' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSearchByTitle(false)}
                >
                  Username
                </button>
              </div>
            )}
          </div>

          <div className="action-section">
            <button className="create-post-btn" onClick={gotopost} title='Create Post'>
              <Plus size={18} />
              <span className="create-text">Create Post</span>
            </button>

            <button className="logout-btn" onClick={handleLogout} title="Log out">
              <LogOut size={22} />
            </button>

            <div className="profile-pic" onClick={gotopfp} title="View Profile">
              <img
                src={i ? `data:image/png;base64,${finalimg}` : finalimg}
                alt="Profile"
                className="profile-img"
              />
            </div>
          </div>
        </div>
      </header>

      {showLogoutDialog && (
        <div className="logout-dialog-backdrop">
          <div className="logout-dialog">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="logout-dialog-buttons">
              <button onClick={cancelLogout} className="cancel-btn">Cancel</button>
              <button onClick={confirmLogout} className="confirm-btn">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}