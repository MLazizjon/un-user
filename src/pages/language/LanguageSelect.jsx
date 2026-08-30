import React, { useState } from 'react';
import './LanguageSelect.css';
import logoImg from '../../assets/image.png';

const LANGUAGES = [
  { code: 'uz', name: "O'zbek" },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
];

export const LanguageSelect = ({ onSelectLanguage }) => {
  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem('app_language') || 'uz'
  );

  const handleSelect = (code) => {
    setSelectedLang(code);
    localStorage.setItem('app_language', code);

    if (onSelectLanguage) {
      onSelectLanguage(code);
    }
  };

  return (
    <div className="language-page">
      <div className="mobile-container">
        {/* Orqa fon bezak effekti */}
        <div className="watermark-bg"></div>

        {/* Header */}
        <div className="header-section">
          <div className="logo-wrapper" data-aos="zoom-in">
            <img
              src={logoImg}
              alt="Samarqand Un Oshi"
              className="brand-logo"
            />
          </div>

          <div data-aos="fade-up" className="title-wrapper">
            <h1 className="welcome-title">Xush kelibsiz!</h1>
            <p className="welcome-subtitle">Davom etish uchun tilni tanlang</p>
          </div>
        </div>

        {/* Languages */}
        <div className="languages-wrapper">
          {LANGUAGES.map((lang, index) => {
            const isActive = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-button ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(lang.code)}
                data-aos="fade-up"
                data-aos-delay={100 + index * 100}
              >
                <div className="lang-button-left">
                  <span className="lang-text">{lang.name}</span>
                </div>

                <div className="arrow-icon">
                  {isActive ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1bb507" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="footer-section"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          <span className="version-label">v1.0</span>
          <span className="brand-label">Powered by IT SAF</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;