import { useEffect } from 'react';
import modelImg from '../assets/images/Screenshot_2026-04-16_at_1.45.47AM.png';

function Screen5() {
  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(200, 200, 200)';
    return () => { document.body.style.backgroundColor = '#ffffff'; };
  }, []);

  return (
    <div className="popup-screen" data-screen="5">
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
              NUMBER
            </h2>
            <div className="popup-form">
              <input
                type="text"
                className="popup-input"
                placeholder="YOUR NUMBER"
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

export default Screen5;
