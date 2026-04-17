import { useEffect } from 'react';
import modelImg from '../assets/images/Screenshot_2026-04-16_at_1.45.47AM.png';

function Screen4() {
  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(200, 200, 200)';
    return () => { document.body.style.backgroundColor = '#ffffff'; };
  }, []);

  return (
    <div className="popup-screen" data-screen="4">
      <div className="popup-card">
        <div className="popup-close">
          <span className="popup-close-x">X</span>
        </div>
        <div className="popup-card-inner">
          <div className="popup-card-left">
            <h2 className="popup-heading">
              UNLOCK 10% OFF<br />
              THE ATONE PIN POLO<br />
              WHEN SIGNING UP<br />
              WITH YOUR<br />
              EMAIL
            </h2>
            <div className="popup-form">
              <input
                type="email"
                className="popup-input"
                placeholder="YOUR EMAIL"
              />
              <button className="popup-btn">ENTER</button>
            </div>
          </div>
          <div className="popup-card-right">
            <img src={modelImg} alt="Model" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Screen4;
