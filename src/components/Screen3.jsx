import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import atoneLogo from '../assets/images/atone-logo.png';
import shopImg from '../assets/images/Shop Now Asset 11.png';

function Screen3() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    return () => { document.body.style.backgroundColor = '#ffffff'; };
  }, []);

  const handleRestart = () => {
    navigate('/');
  };

  return (
    <div className="screen-container" data-screen="3">
      <div className="fullwidth-logo">
        <img src={atoneLogo} alt="Atone" />
      </div>
      <img src={shopImg} alt="Shop Now" className="full-screen-image" />
      <button className="screen3-restart-btn" onClick={handleRestart}>Start Over</button>
    </div>
  );
}

export default Screen3;
