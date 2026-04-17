import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import atoneLogo from '../assets/images/atone-logo.png';
import modelImg from '../assets/images/2.png';
import headingImg from '../assets/images/Screenshot_2026-04-17_at_10_35_45_AM.png';
import { createUser } from '../utils/neonDb.js';
import { logFormSubmit } from '../utils/queryLogger.js';
import { setCurrentUserId } from '../utils/queryLogger.js';

function Screen2() {
  const [email, setEmail] = useState('');
  const [fontSize, setFontSize] = useState(25);
  const [letterSpacing, setLetterSpacing] = useState(3);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (!newEmail) {
      setFontSize(25);
      setLetterSpacing(3);
      return;
    }

    const input = inputRef.current;
    const span = measureRef.current;
    if (!input || !span) return;

    const maxWidth = input.clientWidth - 4;
    span.textContent = newEmail;

    let size = 25;
    // letter-spacing scales linearly: 3px at 25px font, 0px at 8px font
    const calcSpacing = (s) => Math.max(0, ((s - 8) / 17) * 3);

    span.style.fontSize = `${size}px`;
    span.style.letterSpacing = `${calcSpacing(size)}px`;
    while (size > 8 && span.offsetWidth > maxWidth) {
      size -= 0.5;
      span.style.fontSize = `${size}px`;
      span.style.letterSpacing = `${calcSpacing(size)}px`;
    }
    setFontSize(size);
    setLetterSpacing(calcSpacing(size));
  };

  const handleSubmit = async () => {
    if (email.trim()) {
      setLoading(true);
      try {
        const user = await createUser(email, phone);
        setCurrentUserId(user.rows[0].id);
        await logFormSubmit('email', email);
        navigate('/screen3', { state: { phone, email, userId: user.rows[0].id } });
      } catch (error) {
        console.error('Error creating user:', error);
        alert('Error: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="fullwidth-screen" data-screen="2">
      <span
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontFamily: 'Apollo, sans-serif',
          letterSpacing: `${letterSpacing}px`,
          textTransform: 'uppercase',
          pointerEvents: 'none',
          top: '-9999px',
        }}
      />
      <div className="fullwidth-logo">
        <img src={atoneLogo} alt="Atone" />
      </div>
      <div className="fullwidth-body">
        <div className="fullwidth-left">
          <img src={headingImg} alt="Unlock 10% Off" className="fullwidth-heading-img" />
        </div>
        <div className="fullwidth-form-wrapper">
          <div className="fullwidth-form">
            <input
              ref={inputRef}
              type="email"
              className="fullwidth-input"
              placeholder="YOUR EMAIL"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={{ fontSize: `${fontSize}px`, letterSpacing: `${letterSpacing}px` }}
            />
            <button className="fullwidth-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'LOADING...' : 'ENTER'}
            </button>
          </div>
        </div>
        <div className="fullwidth-right">
          <img src={modelImg} alt="Model" />
        </div>
      </div>
    </div>
  );
}

export default Screen2;
