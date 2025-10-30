import React from 'react';
import { TestResult as TestResultData } from '../types';

interface TestResultProps {
  result: TestResultData;
}

const TestResult: React.FC<TestResultProps> = ({ result }) => {
  const horoscopeText = "Aujourd'hui, les étoiles s'alignent en votre faveur. Votre énergie capturée révèle une créativité débordante et une intuition aiguisée. C'est le moment idéal pour démarrer de nouveaux projets et faire confiance à votre instinct. Des opportunités inattendues pourraient se présenter, restez ouvert(e) aux changements.";

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '25px',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '700px',
      width: '90%',
      backdropFilter: 'blur(10px)',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#a89dff', textShadow: '0 0 8px #a89dff' }}>✨ Votre Lecture Astrale ✨</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#c5bfff' }}>Votre Aura Capturée</h4>
          <img src={result.photoUrl} alt="Aura capturée" style={{ maxWidth: '250px', height: 'auto', borderRadius: '8px', border: '2px solid #a89dff' }} />
        </div>
        
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#c5bfff' }}>Données Cosmiques Analysées</h4>
          {/* FIX: Removed duplicate 'padding' property from the style object. */}
          <ul style={{ listStyleType: 'none', margin: 0, textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
            <li><strong>Alignement Cosmique :</strong> {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)}</li>
            {result.battery && (
              <li><strong>Flux Énergétique :</strong> {(result.battery.level * 100).toFixed(0)}% ({result.battery.charging ? 'en charge' : 'stable'})</li>
            )}
            {result.clipboardText && (
               <li><strong>Écho Mémoriel :</strong> "{result.clipboardText.substring(0, 50)}{result.clipboardText.length > 50 ? '...' : ''}"</li>
             )}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '20px' }}>
        <h3 style={{ color: '#c5bfff' }}>Votre Horoscope du Jour</h3>
        <p style={{ lineHeight: '1.6', color: '#e0e0e0' }}>{horoscopeText}</p>
      </div>
    </div>
  );
};

export default TestResult;
