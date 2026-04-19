import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import atoneLogo from '../assets/images/atone-logo.png';
import modelImg from '../assets/images/1.png';
import headingImg from '../assets/images/Screenshot_2026-04-17_at_10.35.24AM.png';
import { createUser } from '../utils/neonDb.js';
import { logFormSubmit, setCurrentUserId } from '../utils/queryLogger.js';

function Screen1() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits, max 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (error && digitsOnly.length === 10) {
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }
    try {
      // Create user first, then set ID for logging
      // Use phone@temp.com as placeholder email (will be updated on screen 2)
      const user = await createUser(`${phone}@temp.com`, phone);
      setCurrentUserId(user.rows[0].id);
      await logFormSubmit('phone_number', phone);
      navigate('/screen2', { state: { phone, userId: user.rows[0].id } });
    } catch (error) {
      console.error('Error submitting:', error);
      setError('Failed to submit. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fullwidth-screen" data-screen="1">
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
              type="text"
              className={`fullwidth-input ${error ? 'input-error' : ''}`}
              placeholder="YOUR NUMBER"
              value={phone}
              onChange={handlePhoneChange}
              onKeyPress={handleKeyPress}
            />
            {error && <span className="error-message">{error}</span>}
            <button className="fullwidth-btn" onClick={handleSubmit}>ENTER</button>
          </div>
        </div>
        <div className="fullwidth-right">
          <img src={modelImg} alt="Model" />
        </div>
      </div>
    </div>
  );
}

export default Screen1;
