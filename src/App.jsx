import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Screen1 from './components/Screen1.jsx';
import Screen2 from './components/Screen2.jsx';
import Screen3 from './components/Screen3.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import './App.css';

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

function App() {
  useEffect(() => {
    const applyScale = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const el = document.getElementById('scale-root');
      if (el) {
        if (isPortrait) {
          el.style.width = '100vw';
          el.style.height = '100vh';
          el.style.transform = 'none';
          el.style.left = '0';
          el.style.top = '0';
        } else {
          const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
          el.style.width = `${DESIGN_WIDTH}px`;
          el.style.height = `${DESIGN_HEIGHT}px`;
          el.style.transform = `scale(${scale})`;
          el.style.left = `${(window.innerWidth - DESIGN_WIDTH * scale) / 2}px`;
          el.style.top = `${(window.innerHeight - DESIGN_HEIGHT * scale) / 2}px`;
        }
        el.classList.toggle('portrait', isPortrait);
      }
    };
    applyScale();
    window.addEventListener('resize', applyScale);
    return () => window.removeEventListener('resize', applyScale);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes - Full Screen */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* App Screens - With Scale */}
        <Route
          path="/*"
          element={
            <div id="scale-root">
              <Routes>
                <Route path="/" element={<Screen1 />} />
                <Route path="/screen2" element={<Screen2 />} />
                <Route path="/screen3" element={<Screen3 />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
