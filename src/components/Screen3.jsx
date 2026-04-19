import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import atoneLogo from '../assets/images/atone-logo.png';
import shopImg from '../assets/images/Shop Now Asset 11.png';
import modelImg from '../assets/images/Screenshot_2026-04-19_at_11.02.44_AM.png';
import headingImg from '../assets/images/Screenshot_2026-04-19_at_11.03.52_AM.png';
import buttonImg from '../assets/images/Screenshot_2026-04-19_at_11.04.23_AM.png';

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
    <>
      {/* Desktop view (unchanged) */}
      <div className="screen-container screen3-desktop" data-screen="3">
        <div className="fullwidth-logo">
          <img src={atoneLogo} alt="Atone" />
        </div>
        <img src={shopImg} alt="Shop Now" className="full-screen-image" />
        <button className="screen3-restart-btn" onClick={handleRestart}>Start Over</button>
      </div>

      {/* Mobile view (same layout as screens 1 & 2) */}
      <div className="fullwidth-screen screen3-mobile" data-screen="3">
        <div className="fullwidth-logo">
          <img src={atoneLogo} alt="Atone" />
        </div>
        <div className="fullwidth-body">
          <div className="fullwidth-left">
            <img src={headingImg} alt="Thank You" className="fullwidth-heading-img" />
          </div>
          <div className="fullwidth-form-wrapper">
            <div className="fullwidth-form">
              <img
                src={buttonImg}
                alt="Shop Now"
                className="thankyou-button-img"
                onClick={handleRestart}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
          <div className="fullwidth-right">
            <img src={modelImg} alt="Model" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Screen3;
