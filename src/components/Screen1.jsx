import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import atoneLogo from '../assets/images/atone-logo.png';
import modelImg from '../assets/images/1.png';
import headingImg from '../assets/images/Screenshot_2026-04-17_at_10.35.24AM.png';
import { logFormSubmit } from '../utils/queryLogger.js';

function Screen1() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (phone.trim()) {
      await logFormSubmit('phone_number', phone);
      navigate('/screen2', { state: { phone } });
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
              className="fullwidth-input"
              placeholder="YOUR NUMBER"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyPress={handleKeyPress}
            />
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
