import atoneLogo from '../assets/images/atone-logo.png';
import headingImg from '../assets/images/Screenshot_2026-04-19_at_11.02.44_AM.png';
import buttonImg from '../assets/images/Screenshot_2026-04-19_at_11.03.52_AM.png';
import modelImg from '../assets/images/Screenshot_2026-04-19_at_11.04.23_AM.png';

function ThankYou() {
  const handleButtonClick = () => {
    // Redirect to shop or external link
    window.location.href = 'https://atone.com';
  };

  return (
    <div className="fullwidth-screen" data-screen="thankyou">
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
              onClick={handleButtonClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
        <div className="fullwidth-right">
          <img src={modelImg} alt="Model" />
        </div>
      </div>
    </div>
  );
}

export default ThankYou;
