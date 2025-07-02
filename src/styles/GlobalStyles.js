import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Import fonts */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');

  /* Color Variables */
  :root {
    --primary-dark-brown: #5C4033;
    --secondary-brown: #8B4513;
    --aged-paper: #F5F1E3;
    --vintage-sepia: #D2B48C;
    --accent-gold: #DAA520;
    --dark-accents: #2F2417;
    --highlight: #CD853F;
    --soft-edges: #BC8F8F;
    --text-dark: #2F2417;
    --text-light: #F5F1E3;
    
    --shadow-light: 0 4px 8px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 8px 16px rgba(0, 0, 0, 0.15);
    --shadow-heavy: 0 12px 24px rgba(0, 0, 0, 0.2);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    width: 100%;
    font-family: 'Crimson Text', serif;
    background-color: var(--aged-paper);
    color: var(--text-dark);
    line-height: 1.6;
    font-size: 18px;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E');
    background-blend-mode: multiply;
    opacity: 0.3;
    z-index: -1;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    color: var(--primary-dark-brown);
    margin-bottom: 1rem;
    letter-spacing: 0.5px;
  }

  h1 {
    font-size: 2.8rem;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 2.2rem;
    color: var(--secondary-brown);
  }

  h3 {
    font-size: 1.8rem;
  }

  h4 {
    font-family: 'Libre Baskerville', serif;
    font-size: 1.4rem;
  }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: var(--secondary-brown);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--accent-gold);
    }
  }

  button, .button {
    font-family: 'Special Elite', cursive;
    background-color: var(--primary-dark-brown);
    color: var(--aged-paper);
    border: 2px solid var(--dark-accents);
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 4px;
    box-shadow: var(--shadow-light);
    position: relative;
    overflow: hidden;
    
    &:hover {
      background-color: var(--secondary-brown);
      transform: translateY(-2px);
      box-shadow: var(--shadow-medium);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-light);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  input, select, textarea {
    font-family: 'Crimson Text', serif;
    padding: 0.5rem 0.8rem;
    margin-bottom: 1rem;
    border: 1px solid var(--soft-edges);
    background-color: var(--aged-paper);
    border-radius: 4px;
    font-size: 1rem;
    width: 100%;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    
    &:focus {
      outline: none;
      border-color: var(--accent-gold);
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Card styles for the game board */
  .card {
    background-color: var(--aged-paper);
    border: 2px solid var(--dark-accents);
    border-radius: 8px;
    box-shadow: var(--shadow-medium);
    padding: 1.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-heavy);
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: var(--aged-paper);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--soft-edges);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-dark-brown);
  }

  /* Utility classes */
  .vintage-text {
    font-family: 'Special Elite', cursive;
  }

  .text-center {
    text-align: center;
  }

  .section-divider {
    height: 2px;
    background-color: var(--soft-edges);
    margin: 2rem 0;
    position: relative;
    
    &::before {
      content: '✧';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--aged-paper);
      padding: 0 1rem;
      color: var(--accent-gold);
      font-size: 1.2rem;
    }
  }
`;

export default GlobalStyles; 