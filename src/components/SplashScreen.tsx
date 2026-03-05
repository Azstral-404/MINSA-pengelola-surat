import { useEffect, useState } from 'react';
import minsaLogo from '@/assets/minsa-logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

const LOAD_STEPS = [
  'Memuat komponen...',
  'Mempersiapkan data...',
  'Mengonfigurasi template...',
  'Hampir selesai...',
  'Siap!',
];

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState(LOAD_STEPS[0]);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + (Math.random() * 4 + 2), 100);
      setProgress(current);
      if (current < 25) setLabel(LOAD_STEPS[0]);
      else if (current < 50) setLabel(LOAD_STEPS[1]);
      else if (current < 75) setLabel(LOAD_STEPS[2]);
      else if (current < 95) setLabel(LOAD_STEPS[3]);
      else setLabel(LOAD_STEPS[4]);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onFinish, 500);
        }, 300);
      }
    }, 55);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a103c 0%, #2d1b69 45%, #1a103c 100%)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        transition: 'opacity 0.5s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(130,90,240,0.22) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -62%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <img
        src={minsaLogo}
        alt="MINSA"
        style={{
          width: '260px',
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 32px rgba(130,90,240,0.75))',
          animation: 'splashLogoIn 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* App subtitle */}
      <div
        style={{
          marginTop: '12px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
          letterSpacing: '0.18em',
          fontWeight: 500,
          animation: 'splashFadeUp 0.6s ease-out 0.3s both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        MINSA Surat Manager
      </div>

      {/* Progress */}
      <div
        style={{
          position: 'absolute',
          bottom: '56px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          animation: 'splashFadeUp 0.5s ease-out 0.5s both',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '5px',
            color: 'rgba(255,255,255,0.38)',
            fontSize: '10.5px',
          }}
        >
          <span>{label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          style={{
            height: '4px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              borderRadius: '2px',
              transition: 'width 0.06s linear',
            }}
          />
        </div>
      </div>

      {/* Version */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '20px',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '10px',
          letterSpacing: '0.05em',
        }}
      >
        v1.0.0 · AZSTRAL
      </div>

      <style>{`
        @keyframes splashLogoIn {
          from { opacity: 0; transform: scale(0.78) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
