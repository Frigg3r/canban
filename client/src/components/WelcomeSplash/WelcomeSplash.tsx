import { Loader } from '@mantine/core';
import { useEffect, useState } from 'react';

interface WelcomeSplashProps {
  imageSrc: string;
  onFinish: () => void;
}

export default function WelcomeSplash({ imageSrc, onFinish }: WelcomeSplashProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, 2400);

    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {/* левая половина */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50vw',
          height: '100vh',
          overflow: 'hidden',
          transform: isLeaving ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 1200ms cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      >
        <img
          src={imageSrc}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* правая половина */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50vw',
          width: '50vw',
          height: '100vh',
          overflow: 'hidden',
          transform: isLeaving ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 1200ms cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      >
        <img
          src={imageSrc}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: '-50vw',
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.08)',
          opacity: isLeaving ? 0 : 1,
          transition: 'opacity 400ms ease',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isLeaving ? 0 : 0.75,
          transition: 'opacity 400ms ease',
        }}
      >
        <Loader color="teal" size="lg" />
      </div>
    </div>
  );
}