import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Import fonts */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap');



  /* Color Variables */
  :root {
    /* Primary Colors */
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
    
    /* Additional Detective Theme Colors */
    --ink-blue: #14213D;
    --ink-faded: rgba(20, 33, 61, 0.7);
    --red-stamp: rgba(139, 0, 0, 0.8);
    --parchment-dark: #E8DCCA;
    --parchment-light: #F8F4E3;
    --pencil-gray: #808080;
    --coffee-stain: rgba(101, 67, 33, 0.2);
    
    /* Shadows */
    --shadow-light: 0 4px 8px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 8px 16px rgba(0, 0, 0, 0.15);
    --shadow-heavy: 0 12px 24px rgba(0, 0, 0, 0.2);
    --shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    
    /* Animations */
    --transition-fast: 0.2s ease;
    --transition-medium: 0.3s ease;
    --transition-slow: 0.5s ease;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

   @font-face {
    font-family: 'Yeseva One';
    src: url('/yeseva.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
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

  /* Coffee stain decorative elements */
  body::after {
    content: '';
    position: fixed;
    bottom: 30px;
    right: 40px;
    width: 100px;
    height: 100px;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cfilter id="filter"%3E%3CfeTurbulence baseFrequency="0.15" numOctaves="2" type="fractalNoise" /%3E%3CfeDisplacementMap in="SourceGraphic" scale="10" /%3E%3C/filter%3E%3Ccircle cx="50" cy="50" r="40" fill="%23654321" opacity="0.15" filter="url(%23filter)" /%3E%3C/svg%3E');
    opacity: 0.3;
    pointer-events: none;
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
    text-shadow: 2px 2px 0px var(--vintage-sepia);
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
    transition: color var(--transition-medium);
    position: relative;
    
    &:hover {
      color: var(--accent-gold);
    }
    
    &.underlined {
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: currentColor;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform var(--transition-medium);
      }
      
      &:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }
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
    transition: all var(--transition-medium);
    border-radius: 4px;
    box-shadow: var(--shadow-light);
    position: relative;
    overflow: hidden;
    letter-spacing: 1px;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      transition: var(--transition-medium);
    }
    
    &:hover {
      background-color: var(--secondary-brown);
      transform: translateY(-2px);
      box-shadow: var(--shadow-medium);
      
      &::before {
        left: 100%;
      }
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-light);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.vintage-button {
      background-color: var(--aged-paper);
      color: var(--primary-dark-brown);
      border: 1px solid var(--primary-dark-brown);
      font-weight: bold;
      
      &:hover {
        background-color: var(--parchment-dark);
      }
    }
  }

  input, select, textarea {
    font-family: 'Special Elite', cursive;
    padding: 0.7rem 1rem;
    margin-bottom: 1rem;
    border: 1px solid var(--soft-edges);
    background-color: var(--parchment-light);
    border-radius: 4px;
    font-size: 1rem;
    width: 100%;
    box-shadow: var(--shadow-inset);
    transition: border-color var(--transition-medium);
    color: var(--ink-blue);
    
    &:focus {
      outline: none;
      border-color: var(--accent-gold);
    }
    
    &::placeholder {
      color: var(--pencil-gray);
      opacity: 0.7;
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
    transition: all var(--transition-medium);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E');
      opacity: 0.1;
      pointer-events: none;
      z-index: 0;
    }
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-heavy);
    }
    
    .card-content {
      position: relative;
      z-index: 1;
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px; /* Reduced from 10px for a more minimalist look */
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--primary-dark-brown);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-brown);
  }

  /* Utility classes */
  .vintage-text {
    font-family: 'Special Elite', cursive;
  }
  
  .serif-text {
    font-family: 'Lora', serif;
  }

  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
  
  .text-left {
    text-align: left;
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
  
  .vintage-stamp {
    display: inline-block;
    font-family: 'Special Elite', cursive;
    color: var(--red-stamp);
    border: 2px solid var(--red-stamp);
    padding: 0.5rem 1rem;
    transform: rotate(-5deg);
    font-size: 1.2rem;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  
  .paper-shadow {
    box-shadow: 0 1px 1px rgba(0,0,0,0.12), 
                0 2px 2px rgba(0,0,0,0.12), 
                0 4px 4px rgba(0,0,0,0.12), 
                0 8px 8px rgba(0,0,0,0.12);
  }
  
  .fade-in {
    animation: fadeIn var(--transition-slow);
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  }
  
  .typewriter {
    overflow: hidden;
    border-right: 2px solid var(--dark-accents);
    white-space: nowrap;
    margin: 0 auto;
    animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
    
    @keyframes typing {
      from { width: 0 }
      to { width: 100% }
    }
    
    @keyframes blink-caret {
      from, to { border-color: transparent }
      50% { border-color: var(--dark-accents) }
    }
  }
`;

export default GlobalStyles;