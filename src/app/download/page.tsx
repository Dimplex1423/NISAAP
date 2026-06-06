'use client';

import { useState, useEffect, useRef } from 'react';

export default function DownloadPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadScript = () => {
    setDownloading('script');
    fetch('/api/download?file=script')
      .then(res => res.text())
      .then(text => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'NISAAP-Audio-Script.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloading(null);
      })
      .catch(() => setDownloading(null));
  };

  const handlePlayAudio = () => {
    fetch('/api/download?file=script')
      .then(res => res.text())
      .then(text => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          const voices = speechSynthesis.getVoices();
          const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                               voices.find(v => v.lang.startsWith('en-GB')) ||
                               voices.find(v => v.lang.startsWith('en'));
          if (englishVoice) utterance.voice = englishVoice;
          speechSynthesis.speak(utterance);
        } else {
          alert('Your browser does not support text-to-speech.');
        }
      });
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#0B1C2C',
      color: '#fff',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#529286' }}>NISAAP</h1>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 400, marginBottom: '2rem', color: '#B0B8C0' }}>Document Downloads</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
        <a href="/NISAAP-User-Credentials.pdf"
           style={{
             display: 'block', padding: '1rem 2rem',
             background: '#529286', color: '#fff',
             textDecoration: 'none', borderRadius: '8px',
             textAlign: 'center', fontSize: '1rem', fontWeight: 600
           }}>
          User Credentials (PDF)
        </a>
        <a href="/NISAAP-User-Credentials.docx"
           style={{
             display: 'block', padding: '1rem 2rem',
             background: '#2A4A3A', color: '#fff',
             textDecoration: 'none', borderRadius: '8px',
             textAlign: 'center', fontSize: '1rem', fontWeight: 600
           }}>
          User Credentials (DOCX)
        </a>
        <a href="/NISAAP-Technical-Documentation.pdf"
           style={{
             display: 'block', padding: '1rem 2rem',
             background: '#1A3A3A', color: '#fff',
             textDecoration: 'none', borderRadius: '8px',
             textAlign: 'center', fontSize: '1rem', fontWeight: 600
           }}>
          Technical Documentation (PDF)
        </a>
        <button
          onClick={handlePlayAudio}
          style={{
            display: 'block', padding: '1rem 2rem',
            background: '#6B21A8', color: '#fff',
            border: 'none', borderRadius: '8px',
            textAlign: 'center', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer', width: '100%'
          }}>
          Play System Overview (Audio)
        </button>
        <button
          onClick={handleStopAudio}
          style={{
            display: 'block', padding: '1rem 2rem',
            background: '#991B1B', color: '#fff',
            border: 'none', borderRadius: '8px',
            textAlign: 'center', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer', width: '100%'
          }}>
          Stop Audio Playback
        </button>
        <button
          onClick={handleDownloadScript}
          disabled={downloading === 'script'}
          style={{
            display: 'block', padding: '1rem 2rem',
            background: downloading === 'script' ? '#3A2060' : '#4A3080',
            color: '#fff', border: 'none', borderRadius: '8px',
            textAlign: 'center', fontSize: '1rem', fontWeight: 600,
            cursor: downloading === 'script' ? 'wait' : 'pointer',
            width: '100%'
          }}>
          {downloading === 'script' ? 'Downloading...' : 'Download Audio Script (TXT)'}
        </button>
      </div>
      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#666', textAlign: 'center', maxWidth: '400px' }}>
        Click &quot;Play System Overview&quot; to hear the audio narration, or download the script to read or record your own narration.
      </p>
    </div>
  );
}
