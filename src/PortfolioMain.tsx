import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import StarBackground from './StarBackground';
import '@fontsource/montserrat/900.css';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { RobotModel, SpaceRobotModel, HoveringSpaceRobot } from './ShuttleScene';
import emailjs from '@emailjs/browser';

// ... after imports, before PortfolioMain component
const projects = [
  {
    title: "Ai-ChatBot",
    description: "Developed a real-time chatbot using Node.js and Axios, powered by the Gemini API for smart conversational responses.",
    tags: ["#Node.js", "#axios", "#express.js", "#gemini API", "#render"],
    liveDemoUrl: "https://web-chat-bot.onrender.com",
    image: "/projects/chatbot.png"
  },
  {
    title: "Realtime-Chatroom",
    description: "Created a live chatroom using Socket.io and Node.js, enabling users to exchange messages instantly in real time.",
    tags: ["#Socket.io", "#node.js", "#express.js", "#frontendtech"],
    liveDemoUrl: "https://simp-online-chat-app.onrender.com",
    image: "/projects/chatroom.png"
  },
  {
    title: "To-DO's List",
    description: "Built a task scheduler using HTML, CSS, and JavaScript to organize daily activities and keep track of important tasks.",
    tags: ["#javascript", "#HTML5", "#CSS", "#bootstrap"],
    liveDemoUrl: "",
    image: "/projects/todo.png"
  },
  {
    title: "Paw's support",
    description: "Developed a platform to help stray animals by connecting them with quick aid and support through a user-friendly interface.",
    tags: ["#Nodejs", "#HTML5", "#CSS", "#Mongodb", "#express.js"],
    liveDemoUrl: "",
    image: "/projects/pawsupport.png"
  }
];

function useLenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 3.0,
      smooth: true,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothTouch: true,
      touchMultiplier: 2,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);
}

const StarJediFont = createGlobalStyle`
  @import url('https://fonts.cdnfonts.com/css/star-jedi');
  html, body, * {
    font-family: 'Star Jedi', 'Arial Black', Arial, sans-serif !important;
    letter-spacing: 0.04em;
  }
`;

const OrbitronFont = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');
`;

const NoScrollX = createGlobalStyle`
  html, body, #root {
    overflow-x: hidden !important;
  }
`;

const Section = styled.section<{ fullscreen?: boolean }>`
  padding: 5rem 2rem 3rem 0rem;
  max-width: ${({ fullscreen }) => (fullscreen ? 'none' : '900px')};
  width: ${({ fullscreen }) => (fullscreen ? 'auto' : '100vw')};
  min-height: ${({ fullscreen }) => (fullscreen ? '100vh' : 'auto')};
  margin: 0 auto;
  position: relative;
  background: transparent;
  ${({ fullscreen }) =>
    fullscreen &&
    `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      background: transparent;
      width: auto;
      max-width: none;
    `}
  @media (max-width: 600px) {
    margin: 0 auto;
    align-items: center !important;
    justify-content: center !important;
    width: 100%;
    max-width: 95vw;
    box-sizing: border-box;
    overflow-x: hidden;
    gap: 0.5rem;
    padding: 1.2rem 2.2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
  font-family: 'StarJedi', 'Fira Mono', 'Consolas', monospace;
  color: #301E67;
  text-shadow: 0 0 2px #301E6744;
  @media (max-width: 600px) {
    font-size: 1rem;
    width: 100%;
    text-align: center;
    margin: 0 auto 0.7rem auto;
  }
`;

const ResumeButton = styled.a`
  display: block;
  margin: 1.5rem auto 0 auto;
  padding: 0.38rem 1.1rem;
  max-width: 220px;
  width: 100%;
  background: rgba(32, 34, 48, 0.82);
  color: #fff;
  border-radius: 0.7rem;
  font-weight: 600;
  font-size: 0.98rem;
  text-decoration: none;
  font-family: inherit;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(255,255,255,0.04) inset;
  border: 1.2px solid rgba(255,255,255,0.09);
  backdrop-filter: blur(6px);
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, border 0.18s, transform 0.14s;
  letter-spacing: 0.02em;
  text-align: center;
  cursor: pointer;
  &:hover {
    background: rgba(255,42,42,0.18);
    color: #ff2a2a;
    border: 1.2px solid #ff2a2a;
    box-shadow: 0 4px 16px 0 rgba(255,42,42,0.13), 0 1px 8px 0 rgba(0,0,0,0.13);
    transform: translateY(-1px) scale(1.025);
  }
`;

const GithubStats = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  min-width: 40px;
  min-height: 40px;
  width: 40px;
  height: 40px;
  background: #18181c;
  color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 7px 1.5px #ff2a2a55, 0 2px 8px #0008;
  padding: 0.3rem;
  z-index: 100;
  font-family: 'Fira Mono', 'Consolas', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s, transform 0.15s;
  cursor: grab;
  border: 2.5px solid #fff;
  backdrop-filter: blur(4px);
  perspective: 200px;
  font-size: 1.3rem;
  outline: none;
  filter: drop-shadow(0 0 6px #ff2a2a99);
  svg {
    width: 20px;
    height: 20px;
    display: block;
  }
  &:hover {
    box-shadow: 0 0 10px 2.5px #ff2a2a77, 0 8px 16px 0 #0008;
    background: #18181c;
    color: #ff2a2a;
    filter: drop-shadow(0 0 12px #ff2a2aee);
    transform: translateY(-4px) scale(1.08) rotateX(8deg);
  }
`;

const NavBar = styled.nav`
  position: fixed;
  top: 2.5rem;
  right: 2.5rem;
  z-index: 200;
  display: flex;
  gap: 0.7rem;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  align-items: center;
  backdrop-filter: none;
  @media (max-width: 900px) {
    right: 1.2rem;
    gap: 0.5rem;
  }
  @media (max-width: 600px) {
    right: 0.5rem;
    gap: 0.3rem;
  }
`;

const NavLink = styled.a`
  color: #fff;
  font-family: 'StarJedi', 'Fira Mono', 'Consolas', monospace;
  font-size: 1.18rem;
  text-decoration: none;
  padding: 0.3rem 0.7rem;
  border-radius: 1.2rem;
  transition: color 0.18s, text-shadow 0.18s;
  cursor: pointer;
  text-shadow: 0 0 2px #ff2a2a44;
  position: relative;
  background: transparent;
  &:hover, &:focus {
    color: #fff;
    text-shadow:
      0 0 8px #ff2a2a,
      0 0 16px #ff2a2a,
      0 0 32px #ff2a2a99;
    outline: none;
  }
`;

// Remove ShreyasTitle styled component and its usage in JSX
// Update SocialIcons to be fixed at the bottom right corner
const SocialIcons = styled.div`
  position: fixed;
  bottom: 2.2rem;
  right: 2.5rem;
  display: flex;
  gap: 1.2rem;
  align-items: center;
  z-index: 200;
`;

const SocialIconLink = styled.a`
  color: #fff;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  transition: color 0.18s;
  &:hover {
    color: #ff2a2a;
  }
`;

const NAV_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'resume', label: 'Resume' },
  { id: 'extracurriculumn', label: 'Extracurriculumn' },
  { id: 'contact', label: 'Contact' },
];

// Red vertical nav bar (circle + gradient line + bullets)
const NavBarContainer = styled.div`
  position: fixed;
  top: 50%;
  right: 8.8rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 300;
  @media (max-width: 1343px) {
    display: none;
  }
`;

const NavBarCircle = styled.div`
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  background: #ff6b81;
  box-shadow: 0 0 10px #ff6b8199;
  margin-bottom: 0.1rem;
`;

const NavBarLine = styled.div`
  width: 0.18rem;
  height: 52vh;
  background: linear-gradient(180deg, #ff6b81 0%, rgba(255,107,129,0.08) 100%);
  border-radius: 1rem;
  position: relative;
`;

const NavBullet = styled.div<{ active: boolean; top: string }>`
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  background: ${({ active }) => (active ? '#ff6b81' : 'rgba(255,255,255,0.13)')};
  border: 2px solid #ff6b81;
  box-shadow: ${({ active }) => (active ? '0 0 8px #ff6b8199' : 'none')};
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: ${({ top }) => top};
`;

const NavBulletRow = styled.div<{ top: string }>`
  position: absolute;
  left: 0;
  width: 100%;
  top: ${({ top }) => top};
  display: flex;
  align-items: center;
`;

const NavLabel = styled.span<{ active: boolean }>`
  color: ${({ active }) => (active ? '#ff6b81' : '#fff')};
  font-family: 'StarJedi', 'Fira Mono', 'Consolas', monospace;
  font-size: 0.93rem;
  letter-spacing: 0.02em;
  transition: color 0.18s;
  user-select: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 7.5rem;
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
`;

const HomeHeroRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 7rem;
  margin-top: -13rem;
  margin-left: 28rem;
  width: 100%;
  @media (max-width: 900px) {
    margin-left: 4vw;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    margin: 0;
    align-items: center;
    gap: 1.2rem;
  }
`;

const HomeHeroTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-left: 0.2rem;
  margin-top: 3rem;
`;

const HomeHeroStrip = styled.div`
  height: 290px;
  width: 0.32rem;
  margin-right: 1.7rem;
  border-radius: 1.2rem;
  background: linear-gradient(180deg, #ff6b81 0%, rgba(255,107,129,0.08) 100%);
  box-shadow: 0 2px 16px #ff6b8155;
`;

const HomeHeroText = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 3.2rem;
  color: #fff;
  font-weight: 900;
  margin: -11.5rem 2.5rem 0 1rem;
  letter-spacing: 0.01em;
  text-align: left;
  .accent {
    color: #ff2a2a;
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: 1.18em;
    letter-spacing: 0.01em;
    display: inline-block;
  }
  @media (max-width: 900px) {
    font-size: 2.1rem;
    margin: -10.5rem 1.5rem 0 0.7rem;
  }
  @media (max-width: 600px) {
    font-size: 1.3rem;
    margin: 0.5rem 0;
    width: 100%;
    word-break: break-word;
    margin-left: 0;
    margin-right: 0;
    text-align: left;
  }
`;

const HomeHeroSubText = styled.div`
  font-family: sans-serif;
  font-size: 1.7rem;
  color: #fff;
  font-weight: 600;
  margin-top: 1rem;
  margin-left: 1rem;
  letter-spacing: 0.01em;
`;

const typewriterWords = [
  'Full stack development',
  'AI & ML',
  'Photography',
  'Video editing',
];

const HomeHeroTypewriter = styled.div`
  font-family: sans-serif;
  font-size: 1.2rem;
  color: #fff;
  font-weight: 200;
  margin-top: 0.4rem;
  margin-left: 1rem;
  letter-spacing: 0.01em;
  min-height: 2.2rem;
  text-align: left;
  display: flex;
  align-items: center;
  .typewriter-cursor {
    display: inline-block;
    width: 1ch;
    color: #ff2a2a;
    animation: blink 1s steps(1) infinite;
    font-weight: 900;
    font-size: 1.2em;
    vertical-align: middle;
  }
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

// Floating Starship Model for Home section
const StarshipModel = React.memo((props: any) => {
  const { scene } = useGLTF('/starship.glb');
  // Only change yellow mesh materials to portfolio red theme
  React.useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material && child.material.color) {
        // Check if the material color is yellow (tolerate slight variations)
        const c = child.material.color;
        const isYellow = (Math.abs(c.r - 1) < 0.1 && Math.abs(c.g - 1) < 0.1 && c.b < 0.2);
        if (isYellow) {
          child.material.color.set('#ff2a2a');
        }
      }
    });
  }, [scene]);
  return <primitive object={scene} {...props} />;
});
useGLTF.preload('/starship.glb');

function RotatingStarship({ scale = 2.2 }) {
  const ref = useRef<any>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.003;
    }
  });
  return <StarshipModel ref={ref} position={[0, 0, 0]} scale={scale} />;
}

const FadeInContent = styled.div<{ show: boolean; delay?: number }>`
  opacity: ${({ show }) => (show ? 1 : 0)};
  transform: ${({ show }) => (show ? 'translateY(0)' : 'translateY(32px)')};
  transition: opacity 1.5s cubic-bezier(0.4,0,0.2,1), transform 1.5s cubic-bezier(0.4,0,0.2,1);
  transition-delay: ${({ delay }) => (delay ? `${delay}ms` : '0ms')};
`;

const AboutContent = styled.div`
  max-width: 900px;
  margin-left: 0;
  margin-right: clamp(2rem, 15vw, 17rem);
  padding: 0 1.5rem 0 0;
  text-align: left;
  margin-bottom: 0;
  & > :last-child {
    margin-bottom: 0 !important;
  }
`;

const AboutPanel = styled.div`
  background: rgba(20, 20, 30, 0.03);
  border-radius: 1.5rem;
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.13);
  backdrop-filter: blur(6px);
  padding: 2.5rem 2.5rem 2.2rem 2.5rem;
  margin: 0 auto;
  max-width: 900px;
`;

// --- Skills Section Styles ---
const SkillsSection = styled(Section)`
  align-items: flex-start !important;
  padding-left: 0 !important;
  margin-left: clamp(2rem, 15vw, 17rem);
  margin-top: 0;
  & > :first-child {
    margin-top: 0 !important;
  }
`;

const SkillsIntro = styled.div`
  letter-spacing: 0.13em;
  color: rgba(255,255,255,0.55);
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: clamp(1rem, 1.5vw, 1.18rem);
  margin-bottom: 1.2rem;
  text-transform: uppercase;
  text-align: left;
`;

const SkillsTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: clamp(2.1rem, 5vw, 3.2rem);
  color: #fff;
  margin-bottom: 1.2rem;
  line-height: 1.08;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 12px #1a0a0a99;
  text-align: left;
  .accent {
    color: #ff2a2a;
  }
`;

const SkillsDesc = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: clamp(0.92rem, 1.2vw, 1rem);
  color: rgba(255,255,255,0.75);
  line-height: 1.6;
  max-width: 700px;
  margin-bottom: 2.5rem;
  text-align: left;
`;

const SkillsPanel = styled.div`
  background: rgba(24, 26, 38, 0.82);
  border-radius: 1.5rem;
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.13);
  padding: 1.3rem 0.7rem 1.2rem 0.7rem;
  margin: 2.5rem 0 0 0;
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid rgba(255,255,255,0.07);
  box-sizing: border-box;
  z-index: 1;
  @media (max-width: 600px) {
    margin: 0 auto 0.7rem auto;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 95vw;
    box-sizing: border-box;
    overflow-x: hidden;
    gap: 0.5rem;
    padding: 0.5rem 2.2rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
  }
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
  width: 100%;
  padding: 0;
  justify-items: center;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.5rem;
    justify-items: center;
    align-items: center;
  }
  @media (max-width: 600px) {
    margin: 0 auto;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 95vw;
    box-sizing: border-box;
    overflow-x: hidden;
    gap: 0.5rem;
    justify-items: center;
  }
`;

const SkillItem = styled.div`
  background: rgba(255,255,255,0.09);
  border-radius: 1.1rem;
  box-shadow: none;
  border: 1.2px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(28px);
  padding: 0.7rem 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 86px;
  margin: 0.1rem 0.05rem;
  transition: transform 0.16s, box-shadow 0.16s, background 0.16s, z-index 0.2s;
  cursor: pointer;
  overflow: visible;
  color: #fff;
  perspective: 600px;
  position: relative;
  span:first-child {
    font-size: 2.1rem;
    color: inherit;
  }
  span:last-child {
    font-size: 0.62rem;
    margin-top: 0.18rem;
    color: inherit;
    display: block;
    width: 100%;
    text-align: center;
    padding: 0 0.2rem;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }
  img {
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), filter 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform, box-shadow, filter;
    transform-style: preserve-3d;
    z-index: 1;
    position: relative;
  }
  &:hover {
    z-index: 10;
  }
  &:hover img {
    /* Use the data-pop attribute for transform */
    transform: var(--pop-transform, scale(1.38) rotateX(18deg) rotateY(-12deg) translateZ(32px));
    box-shadow: 0 8px 24px 0 rgba(255,42,42,0.18), 0 2px 12px 0 #ff2a2a99, 0 0 0 4px #ff2a2a22, 0 0 16px 4px #ff2a2a33;
    filter: brightness(1.12) drop-shadow(0 0 8px #ff2a2a99) drop-shadow(0 0 16px #fff4);
  }
  box-sizing: border-box;
  margin-bottom: 1.1rem;
  @media (max-width: 600px) {
    max-width: 95vw;
    width: 100%;
    min-width: 0;
    margin: 0 auto 0.7rem auto;
    font-size: 0.92rem;
    padding: 0.5rem 0.3rem;
    box-sizing: border-box;
    overflow-x: hidden;
    border-radius: 0.5rem;
  }
`;

// Update ProjectsGrid for masonry-like effect
const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.2rem;
  width: 100%;
  grid-auto-rows: minmax(260px, auto);
  align-items: stretch;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

// Update ProjectCard to remove fixed height, but keep min-height
const ProjectCard = styled.div`
  background: rgba(255,255,255,0.09);
  border-radius: 1.1rem;
  box-shadow: none;
  border: 1.2px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(28px);
  padding: 0.45rem 0.7rem 0.5rem 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  width: 100%;
  margin: 0 auto;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  overflow: hidden;
  word-break: break-word;
  box-sizing: border-box;
  margin-bottom: 0.7rem;
  @media (max-width: 900px) {
    min-height: 200px;
  }
  @media (max-width: 600px) {
    min-height: 140px;
  }
  & > * {
    min-width: 0;
    box-sizing: border-box;
  }
`;

const ProjectImage = styled.div`
  width: calc(100% - 1.2rem);
  height: 56px;
  background: #181c1f;
  background-size: cover;
  background-position: center;
  border-radius: 0.7rem;
  box-shadow: 0 2px 12px 0 #000a;
  position: relative;
  overflow: hidden;
  margin: 0.7rem auto 0.6rem auto;
  padding: 0.18rem;
  background-clip: padding-box;
  border: 1.5px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const ProjectTitle = styled.div`
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: clamp(1rem, 2vw, 1.18rem);
  font-weight: 600;
  color: #fff;
  margin: 0.8rem 0 0.4rem 0;
  padding: 0 1rem;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 6px #1a0a0a33;
  text-align: left;
  width: 100%;
`;

const ProjectDesc = styled.div`
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: clamp(0.92rem, 1.5vw, 0.98rem);
  color: rgba(255,255,255,0.82);
  line-height: 1.45;
  padding: 0 0.7rem 0 0.7rem;
  margin-bottom: 0.7rem;
  text-align: left;
  width: 100%;
  max-width: 100%;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
  min-width: 0;
  box-sizing: border-box;
`;

const ProjectTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 0 0.5rem 0;
  justify-content: flex-start;
  align-items: flex-start;
`;

const ProjectTag = styled.div`
  font-size: 0.82rem;
  color: #ff2a2a;
  background: rgba(255,42,42,0.08);
  border-radius: 0.4rem;
  padding: 0.08rem 0.5rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  letter-spacing: 0.01em;
`;

// Restore ThreeDPlaceholder, ContactForm, Input, Textarea, SubmitButton styled components
const ThreeDPlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background: rgba(32, 40, 60, 0.55); // semi-transparent for readability
  border-radius: 12px;
  margin-bottom: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.2rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  opacity: 0.85;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  max-width: 400px;
`;

const Input = styled.input`
  padding: 0.7rem 1.1rem;
  border-radius: 7px;
  border: none;
  font-size: 0.97rem;
  font-family: system-ui, sans-serif;
  background: rgba(255,255,255,0.07);
  color: #fff;
  width: 100%;
  max-width: 370px;
  box-sizing: border-box;
  outline: none;
  &:focus, &:active {
    outline: none;
    box-shadow: none;
    border: none;
  }
`;

const Textarea = styled.textarea`
  padding: 0.7rem 1.1rem;
  border-radius: 7px;
  border: none;
  font-size: 0.97rem;
  font-family: system-ui, sans-serif;
  min-height: 90px;
  background: rgba(255,255,255,0.07);
  color: #fff;
  width: 100%;
  max-width: 370px;
  box-sizing: border-box;
  outline: none;
  &:focus, &:active {
    outline: none;
    box-shadow: none;
    border: none;
  }
`;

const SubmitButton = styled.button`
  padding: 0.38rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #ff1744 0%, #ff6b81 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 2px 8px #0002;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  margin-top: 0.7rem;
  width: fit-content;
  &:hover {
    background: linear-gradient(90deg, #ff6b81 0%, #ff1744 100%);
    color: #fff;
    box-shadow: 0 4px 16px #ff174455;
  }
`;

// Update ExtraGrid to always have 3 columns on desktop, stack on mobile
const ExtraGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3.5rem;
  width: 100%;
  margin: 0 0 2.2rem 0;
  align-items: stretch;
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
    gap: 2.2rem;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

// Update ExtraCard for column layout and relative positioning
const ExtraCard = styled.div`
  background: rgba(255,255,255,0.09);
  border-radius: 0.7rem;
  box-shadow: none;
  border: 1.2px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(28px);
  padding: 0.4rem 1rem 0.4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  max-width: 520px;
  min-height: 320px;
  height: 320px;
  margin: 0 auto;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  &:hover {
    box-shadow: 0 4px 18px 0 rgba(255,0,80,0.13);
    transform: translateY(-3px) scale(1.015);
  }
  @media (max-width: 900px) {
    min-height: 260px;
    height: 260px;
  }
  @media (max-width: 600px) {
    min-height: 200px;
    height: 200px;
    max-width: 95vw;
  }
`;

// Remove absolute positioning from ExtraLogo
const ExtraLogo = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 9px;
  object-fit: cover;
  background: #fff;
  flex-shrink: 0;
  display: block;
  margin-right: 14px;
`;

const ExtraTitle = styled.div`
  font-weight: 700;
  font-size: 0.89rem;
  color: #fff;
  margin-bottom: 4px;
  text-align: left;
  letter-spacing: 0.01em;
  word-break: break-word;
  max-height: 2.7em;
  overflow: hidden;
  padding-right: 48px;
`;
const ExtraOrg = styled.a`
  color: #7fd7ff;
  font-weight: 600;
  font-size: 0.81rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  text-decoration: underline;
  margin-bottom: 3px;
  text-align: left;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ExtraMeta = styled.div`
  font-size: 0.73rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  color: #bdb7d6;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ExtraBadge = styled.span`
  background: rgba(255, 107, 129, 0.18);
  color: #bdb7d6;
  border-radius: 7px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  margin-left: 7px;
  font-weight: 500;
  white-space: nowrap;
  border: none;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ExtraDesc = styled.div`
  color: #eae6ff;
  font-size: 0.68rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  margin: 0 0 4px 0;
  text-align: left;
  line-height: 1.35;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ExtraTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.18rem;
  align-items: flex-start;
  margin: 0 0 2px 0;
  padding: 0;
`;

const extracurriculars = [
  {
    logo: '/extracurriculumn/mudita.jpg',
    title: 'Member at Mudita DSI',
    org: { name: 'Mudita, DSI', url: '#' },
    date: 'Nov 2024 - Present',
    badge: 'Volunteer',
    desc: 'As a photographer and video editor for Team Mudita, I capture and edit moments from events like Valuable Vintage and Pawsitivity, spreading joy and ethics through visual storytelling.',
    tags: ['Photography', 'Video Editing', 'Event Coverage', 'Visual Storytelling', 'Ethics'],
  },
  {
    logo: '/extracurriculumn/codez.webp',
    title: 'Member Codezero',
    org: { name: 'Codezero', url: '#' },
    date: 'Oct 2024 - Present',
    badge: 'Member',
    desc: 'A technical club focused on learning and organizing various events and also improves the technical skills of students in the department.',
    tags: ['Technical Club', 'Event Organization', 'Skill Development', 'Learning', 'Department Activities'],
  },
];

// Add styled-components for the glassmorphic panel and headings
const ContactPanel = styled.div`
  background: rgba(255,255,255,0.04);
  border-radius: 1.3rem;
  box-shadow: none;
  border: 1.2px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(28px);
  padding: 2.5rem 2.7rem 2.5rem 2.7rem;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.7rem;
  box-sizing: border-box;
  z-index: 1;
  @media (max-width: 600px) {
    margin: 0 auto 0.7rem auto;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 95vw;
    box-sizing: border-box;
    overflow-x: hidden;
    gap: 0.5rem;
    padding: 0.5rem 2.2rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
  }
`;
const ContactSubheading = styled.div`
  color: #bdb7d6;
  font-size: 1.01rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  letter-spacing: 0.13em;
  margin-bottom: 0.7rem;
  text-transform: uppercase;
`;
const ContactHeading = styled.h2`
  color: #fff;
  font-size: 2.7rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  margin: 0 0 1.7rem 0;
  letter-spacing: 0.01em;
`;

// Add ProjectCard3D component for 3D interactive effect
function ProjectCard3D({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1;
    const py = (y / rect.height) * 2 - 1;
    setTilt({ x: py * 12, y: px * 16 });
    setIsHovering(true);
  };
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovering(false);
  };
  return (
    <ProjectCard
      {...props}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...(props.style || {}),
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.035 : 1})`,
        transition: isHovering
          ? 'transform 0.18s cubic-bezier(0.22,1,0.36,1)'
          : 'transform 0.38s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {children}
    </ProjectCard>
  );
}

export default function PortfolioMain() {
  useLenisScroll();
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timeout);
  }, []);
  // Draggable Github button state
  const [githubPos, setGithubPos] = useState({ x: 20, y: window.innerHeight - 80 });
  const githubDrag = useRef<{ offsetX: number; offsetY: number; dragging: boolean }>({ offsetX: 0, offsetY: 0, dragging: false });

  // Track which section is active
  const [activeSection, setActiveSection] = useState('home');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Scroll handler to update active section
  useEffect(() => {
    const handleScroll = () => {
      let current = 'home';
      for (const { id } of NAV_SECTIONS) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.33) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section
  const handleNavClick = (id: string) => {
    if (id === 'resume') {
      window.open('#', '_blank'); // Replace '#' with your actual resume link
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Drag handlers for Github button
  const onGithubMouseDown = (e: React.MouseEvent) => {
    githubDrag.current.dragging = true;
    githubDrag.current.offsetX = e.clientX - githubPos.x;
    githubDrag.current.offsetY = e.clientY - githubPos.y;
    document.body.style.userSelect = 'none';
  };
  const onGithubMouseUp = () => {
    githubDrag.current.dragging = false;
    document.body.style.userSelect = '';
  };
  const onGithubMouseMove = (e: MouseEvent) => {
    if (githubDrag.current.dragging) {
      let x = e.clientX - githubDrag.current.offsetX;
      let y = e.clientY - githubDrag.current.offsetY;
      // Prevent off-screen (use 40px, the actual button size)
      x = Math.max(0, Math.min(window.innerWidth - 40, x));
      y = Math.max(0, Math.min(window.innerHeight - 40, y));
      setGithubPos({ x, y });
    }
  };
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('mousemove', onGithubMouseMove);
    window.addEventListener('mouseup', onGithubMouseUp);
    return () => {
      window.removeEventListener('mousemove', onGithubMouseMove);
      window.removeEventListener('mouseup', onGithubMouseUp);
    };
  });

  // Touch support for both buttons
  const onGithubTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    githubDrag.current.dragging = true;
    githubDrag.current.offsetX = touch.clientX - githubPos.x;
    githubDrag.current.offsetY = touch.clientY - githubPos.y;
  };
  const onGithubTouchMove = (e: React.TouchEvent) => {
    if (githubDrag.current.dragging) {
      const touch = e.touches[0];
      let x = touch.clientX - githubDrag.current.offsetX;
      let y = touch.clientY - githubDrag.current.offsetY;
      x = Math.max(0, Math.min(window.innerWidth - 40, x));
      y = Math.max(0, Math.min(window.innerHeight - 40, y));
      setGithubPos({ x, y });
    }
  };
  const onGithubTouchEnd = () => {
    githubDrag.current.dragging = false;
  };

  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string|null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      // EmailJS config (replace with your own)
      await emailjs.send(
        'service_2uwhdko',
        'template_bn3hup4',
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        'qQl56zMUkTLkEqwJ9'
      );
      setResult('Message sent via email!');
      // WhatsApp (replace with your number, e.g. 919999999999)
      const waMsg = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`);
      window.open(`https://wa.me/918618167030?text=${waMsg}`,'_blank');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setResult('Failed to send. Try again!');
    }
    setSending(false);
  };

  // Generate a random pop transform for each skill (memoized so it doesn't change on every render)
  const popTransforms = useMemo(() => skillList.map(getRandomPopTransform), []);

  // Set the --pop-transform CSS variable for each logo
  useEffect(() => {
    document.querySelectorAll('.pop-logo').forEach((el) => {
      (el as HTMLElement).style.setProperty('--pop-transform', el.getAttribute('data-pop') || '');
    });
  }, []);

  // Ensure GitHub button stays in view on window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setGithubPos(pos => {
        let x = Math.max(0, Math.min(window.innerWidth - 40, pos.x));
        let y = Math.max(0, Math.min(window.innerHeight - 40, pos.y));
        return { x, y };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ... inside PortfolioMain component, after githubPos state
  const [showGithubPopup, setShowGithubPopup] = useState(false);

  // ... after useEffect for resize
  useEffect(() => {
    if (!showGithubPopup || typeof window === 'undefined') return;
    const handleClick = (e: MouseEvent) => {
      setShowGithubPopup(false);
    };
    setTimeout(() => {
      window.addEventListener('mousedown', handleClick);
    }, 0);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showGithubPopup]);

  // ... inside PortfolioMain component, after showGithubPopup state
  const [githubStats, setGithubStats] = useState<any>(null);
  const [githubStatsLoading, setGithubStatsLoading] = useState(false);
  const [githubStatsError, setGithubStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!showGithubPopup || typeof window === 'undefined') return;
    setGithubStats(null);
    setGithubStatsLoading(true);
    setGithubStatsError(null);
    fetch('https://api.github.com/users/ShreyasN707') // <-- updated username
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setGithubStats(data);
        setGithubStatsLoading(false);
      })
      .catch(err => {
        setGithubStatsError('Could not load stats.');
        setGithubStatsLoading(false);
      });
  }, [showGithubPopup]);

  return (
    <>
      <NoScrollX />
      <StarJediFont />
      <OrbitronFont />
      <StarBackground />
      <SocialIcons>
        <SocialIconLink href="https://github.com/" target="_blank" title="GitHub" rel="noopener noreferrer">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/></svg>
        </SocialIconLink>
        <SocialIconLink href="https://www.linkedin.com/in/shreyas-naik-44717b332/" target="_blank" title="LinkedIn" rel="noopener noreferrer">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.1-.9-2-2-2s-2 .9-2 2v4.5h-3v-9h3v1.22c.41-.59 1.19-1.22 2-1.22 1.66 0 3 1.34 3 3v6z"/></svg>
        </SocialIconLink>
        <SocialIconLink href="https://www.instagram.com/shreyas___n_?igsh=MW0yZ2trazV4cXZvYw==" target="_blank" title="Instagram" rel="noopener noreferrer">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 2.25a6.25 6.25 0 1 1 0 12.5 6.25 6.25 0 0 1 0-12.5zm0 1.5a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5zm6.13 1.12a1.13 1.13 0 1 1-2.25 0 1.13 1.13 0 0 1 2.25 0z"/></svg>
        </SocialIconLink>
        <SocialIconLink
          href="#contact"
          title="Email"
          onClick={e => {
            e.preventDefault();
            const el = document.getElementById('contact');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm0 12H4V8.99l8 6.99 8-6.99V18z"/></svg>
        </SocialIconLink>
      </SocialIcons>
      <GithubStats
        title="GitHub Stats"
        x={githubPos.x}
        y={githubPos.y}
        onMouseDown={onGithubMouseDown}
        onTouchStart={onGithubTouchStart}
        onTouchMove={onGithubTouchMove}
        onTouchEnd={onGithubTouchEnd}
        onClick={e => { e.stopPropagation(); setShowGithubPopup(v => !v); }}
        style={{ touchAction: 'none' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#181c1f" />
          <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" fill="#fff"/>
        </svg>
      </GithubStats>
      {showGithubPopup && (
        <div
          style={{
            position: 'fixed',
            left: githubPos.x + 70,
            top: githubPos.y - 10,
            zIndex: 200,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '1.3rem',
            boxShadow: '0 4px 24px #000a',
            padding: '0.6rem 0.9rem',
            minWidth: 180,
            fontFamily: 'JetBrains Mono, Fira Mono, Consolas, monospace',
            fontSize: '0.89rem',
            fontWeight: 400,
            border: '1.2px solid rgba(255,255,255,0.22)',
            transition: 'opacity 0.2s',
            backdropFilter: 'blur(28px)',
            color: '#eafffa',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Software-related icon at the top left */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5, marginLeft: 1 }}>
            {/* Simple terminal icon using SVG */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ marginRight: 4 }}><rect x="2" y="3.5" width="16" height="13" rx="3" fill="#23272e" stroke="#7fffa7" strokeWidth="1.2"/><path d="M6.5 8L9 10L6.5 12" stroke="#7fffa7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="11.5" y="11.2" width="3" height="1.1" rx="0.5" fill="#7fffa7"/></svg>
            <span style={{ color: '#7fffa7', fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.01em' }}>Terminal</span>
          </div>
          {/* Terminal-inspired content, but not an exact copy */}
          <div style={{ color: '#7fffa7', fontWeight: 400, fontSize: '0.85rem', marginBottom: 1 }}>
            {githubStats && githubStats.login ? (
              <>
                {githubStats.login}@github : ~/portfolio $ <span style={{ color: '#eafffa' }}>status --live</span>
              </>
            ) : (
              'Loading...'
            )}
          </div>
          <div style={{ color: '#6fff57', fontWeight: 400, fontSize: '0.85rem', marginBottom: 1 }}>● LIVE</div>
          <div style={{ color: '#eafffa', fontWeight: 400, marginBottom: 1 }}>Branch: <span style={{ color: '#ff2a2a', fontWeight: 400 }}>main</span></div>
          <div style={{ color: '#eafffa', fontWeight: 400, marginBottom: 1 }}>Project: <span style={{ background: '#23272e', color: '#7fffa7', borderRadius: 4, padding: '1px 6px', fontWeight: 400, fontSize: '0.89rem' }}>portfolio-website</span></div>
          {githubStats && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '6px 0 3px 0' }}>
                <img src={githubStats.avatar_url} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #fff', boxShadow: '0 2px 8px #0004' }} />
                <div>
                  <div style={{ fontWeight: 400, fontSize: '0.91rem', color: '#fff' }}>{githubStats.name}</div>
                  <div style={{ color: '#ff2a2a', fontWeight: 400, fontSize: '0.85rem' }}>@{githubStats.login}</div>
                </div>
              </div>
              <div style={{ color: '#eaeaea', fontSize: '0.85rem', marginBottom: 5 }}>{githubStats.bio}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', margin: '0.3rem 0 0.1rem 0' }}>
                <div><span style={{ color: '#ff2a2a', fontWeight: 400 }}>{githubStats.public_repos}</span><br/><span style={{ fontSize: '0.81rem', color: '#eaeaea' }}>Repos</span></div>
              </div>
              <a href={githubStats.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#7fffa7', textDecoration: 'underline', fontWeight: 400, marginTop: 5, fontSize: '0.87rem', display: 'inline-block' }}>Open Profile →</a>
            </>
          )}
          {githubStatsLoading && <div style={{ margin: '0.5rem 0', fontSize: '0.85rem' }}>Loading...</div>}
          {githubStatsError && <div style={{ color: '#ff2a2a', margin: '0.5rem 0', fontSize: '0.85rem' }}>{githubStatsError}</div>}
          <div style={{ color: '#7fffa7', fontWeight: 400, fontSize: '0.85rem', marginTop: 5 }}>
            {githubStats && githubStats.login ? (
              <>{githubStats.login}@portfolio : ~ $ <span style={{ color: '#eafffa', opacity: 0.7 }}>Type 'help'...</span></>
            ) : (
              '...'
            )}
          </div>
        </div>
      )}
      <NavBarContainer>
        <NavBarLine>
          {NAV_SECTIONS.map(({ id, label }, idx) => {
            const top = `${(idx / (NAV_SECTIONS.length - 1)) * 95}%`;
            return (
              <NavBulletRow key={id} top={top}>
                <NavBullet
                  active={activeSection === id}
                  onClick={() => handleNavClick(id)}
                  title={label}
                  top={top}
                />
                <NavLabel active={activeSection === id}>{label}</NavLabel>
              </NavBulletRow>
            );
          })}
        </NavBarLine>
      </NavBarContainer>
      {/* Main sections with Framer Motion reveal */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, amount: 0.2 }}>
        <FadeInContent show={showContent} delay={0}>
          <Section id="home" fullscreen style={{ position: 'relative', overflow: 'visible' }}>
            {/* Add extra top margin to allow the red tint to spread more above */}
            <div style={{ height: '2.5rem' }} />
            <HomeHeroRow>
              <HomeHeroStrip />
              <HomeHeroTextBlock>
                <HomeHeroText>Hi, I&apos;m <span className="accent">Shreyas</span></HomeHeroText>
                <HomeHeroSubText>I do:</HomeHeroSubText>
                <TypewriterAnimation />
              </HomeHeroTextBlock>
            </HomeHeroRow>
            {/* Floating Car Canvas */}
            <div style={{
              position: 'absolute',
              left: '50%',
              bottom: '3%',
              transform: 'translateX(-50%)',
              width: '800px',
              height: '420px',
              zIndex: 2,
              pointerEvents: 'auto',
            }}>
              <Canvas camera={{ position: [0, 0, 8], fov: 40 }} style={{ background: 'transparent', width: '100%', height: '100%' }}>
                <ambientLight intensity={1.2} />
                <directionalLight position={[2, 4, 4]} intensity={1.5} />
                <Suspense fallback={null}>
                  <RotatingStarship scale={3.2} />
                </Suspense>
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={false} 
                  enableRotate={true} 
                  minPolarAngle={Math.PI/2 - 0.5}
                  maxPolarAngle={Math.PI/2 + 0.5}
                />
              </Canvas>
            </div>
          </Section>
        </FadeInContent>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, amount: 0.2 }}>
        <FadeInContent show={showContent} delay={500}>
          <Section id="about" fullscreen>
            <AboutContent>
              <motion.div
                initial={{ opacity: 0, x: -40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <div style={{
                  letterSpacing: '0.13em',
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1rem, 1.5vw, 1.18rem)',
                  marginBottom: '1.2rem',
                  textTransform: 'uppercase',
                  textAlign: 'left',
                }}>
                  INTRODUCTION
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <div style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(2.1rem, 5vw, 4.2rem)',
                  color: '#ff2a2a',
                  marginBottom: '2.2rem',
                  lineHeight: 1.08,
                  letterSpacing: '0.01em',
                  textShadow: '0 2px 12px #1a0a0a99',
                  textAlign: 'left',
                }}>
                  Overview<span style={{ color: '#fff' }}>.</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <div style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(0.92rem, 1.2vw, 1rem)',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.6,
                  maxWidth: '820px',
                  textAlign: 'left',
                  letterSpacing: '0.01em',
                }}>
                  👋 Hi, I'm Shreyas Naik — a passionate AIML student at Dayananda Sagar College of Engineering, Bangalore.<br/><br/>
                  I'm deeply driven by curiosity and a love for coding, constantly exploring the world of AI and Machine Learning while building cool projects along the way. A fast learner by nature, I thrive on picking up new skills — from backend development to the latest in tech trends.<br/><br/>
                  But my interests don't stop at code.<br/><br/>
                  🎬 I'm also an active video editor and a visual storyteller, crafting edits that capture emotion and energy. With a keen eye for photography and a creative edge, I blend tech and art to express ideas beyond the screen.<br/><br/>
                  Always learning. Always creating. Always evolving.
                </div>
              </motion.div>
            </AboutContent>
          </Section>
        </FadeInContent>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, amount: 0.2 }}>
        <FadeInContent show={showContent} delay={600}>
          <SkillsSection id="skills" fullscreen>
            <motion.div
              initial={{ opacity: 0, x: -40, y: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
              viewport={{ amount: 0.2 }}
            >
              <SkillsIntro>MY TECHNICAL ARSENAL</SkillsIntro>
              <SkillsTitle>Skills &amp; <span className="accent">Technologies.</span></SkillsTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40, y: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
              viewport={{ amount: 0.2 }}
            >
              <SkillsDesc>
                I work with a versatile set of programming languages, frameworks, and tools to build robust, scalable, and efficient applications.<br/>
                My technical toolkit reflects my adaptability and passion for crafting impactful solutions :
              </SkillsDesc>
            </motion.div>
            <SkillsPanel>
              <SkillsGrid>
                {skillList.map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60, y: 40, scale: 0.85, rotateX: 12 }}
                    whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 160, damping: 32, duration: 1.2, delay: i * 0.09 }}
                    viewport={{ amount: 0.2 }}
                    style={{ width: '100%' }}
                  >
                    <SkillItem>
                      <img
                        src={skill.src}
                        alt={skill.name}
                        style={{ width: 40, height: 40 }}
                        className="pop-logo"
                        data-pop={popTransforms[i]}
                      />
                      <span>{skill.name}</span>
                    </SkillItem>
                  </motion.div>
                ))}
              </SkillsGrid>
            </SkillsPanel>
          </SkillsSection>
        </FadeInContent>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, amount: 0.2 }}>
        <FadeInContent show={showContent} delay={1500}>
          <Section id="projects" fullscreen style={{ alignItems: 'flex-start', paddingLeft: 0, marginLeft: 'clamp(2rem, 15vw, 17rem)', marginTop: 0 }}>
            <div style={{ maxWidth: 950, width: '100%' }}>
              <motion.div
                initial={{ opacity: 0, x: -40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <SkillsIntro>MY WORK</SkillsIntro>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <SkillsTitle>Projects<span className="accent">.</span></SkillsTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <SkillsDesc>
                  The following projects highlight my technical skills and hands-on experience.<br/>
                  Each one represents a unique challenge I tackled, complete with concise descriptions and direct links to the source code repositories.
                </SkillsDesc>
              </motion.div>
              <ProjectsGrid>
                {projects.map((project, i) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80, y: 60, scale: 0.85, rotateX: 14 }}
                    whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 36, duration: 1.4, delay: i * 0.13 }}
                    viewport={{ amount: 0.2 }}
                    style={{ width: '100%' }}
                  >
                    <ProjectCard3D>
                      <ProjectImage style={{ backgroundImage: `url('${project.image}')` }} />
                      <ProjectTitle>{project.title}</ProjectTitle>
                      <ProjectDesc>{project.description}</ProjectDesc>
                      <ProjectMetaRow>
                        <ProjectTags>
                          {project.tags.map(tag => (
                            <ProjectTag key={tag}>{tag}</ProjectTag>
                          ))}
                        </ProjectTags>
                        {project.liveDemoUrl && (
                          <ResumeButton href={project.liveDemoUrl} target="_blank">Live Demo</ResumeButton>
                        )}
                      </ProjectMetaRow>
                    </ProjectCard3D>
                  </motion.div>
                ))}
              </ProjectsGrid>
              <ResumeButton href="/ShreyasResume.pdf" target="_blank" rel="noopener noreferrer">Open Resume</ResumeButton>
            </div>
          </Section>
        </FadeInContent>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, amount: 0.2 }}>
        <FadeInContent show={showContent} delay={2000}>
          <Section id="extracurriculumn" fullscreen style={{ marginTop: '2.2rem', alignItems: 'flex-start', paddingLeft: 0, marginLeft: 'clamp(2rem, 15vw, 17rem)' }}>
            <div style={{ width: '100%', maxWidth: 800 }}>
              <motion.div
                initial={{ opacity: 0, x: -40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <div style={{
                  letterSpacing: '0.13em',
                  color: '#fff',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(1rem, 1.5vw, 1.18rem)',
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  textAlign: 'left',
                }}>
                  <span style={{ color: '#ff1744' }}>BEYOND</span> DEVELOPMENT
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <SectionTitle style={{ fontSize: 'clamp(2.3rem, 5vw, 4.5rem)', textAlign: 'left', marginBottom: '1.1rem', color: '#fff', fontWeight: 900 }}>
                  Extracurricular<span style={{ color: '#ff1744' }}>.</span>
                </SectionTitle>
              </motion.div>
              <ExtraGrid>
                {extracurriculars.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50, y: 38, scale: 0.85, rotateX: 10 }}
                    whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 34, duration: 1.2, delay: i * 0.11 }}
                    viewport={{ amount: 0.2 }}
                    style={{ width: '100%' }}
                  >
                    <ExtraCard style={{ transition: 'box-shadow 0.3s' }}>
                      <div style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: 0 }}>
                        <ExtraTopRow>
                          <ExtraLogo src={item.logo} alt={item.org.name} />
                          <ExtraTitle>{item.title}</ExtraTitle>
                        </ExtraTopRow>
                        <ExtraOrg href={item.org.url} target="_blank" rel="noopener noreferrer">{item.org.name}</ExtraOrg>
                        <ExtraMeta>
                          {item.date} <ExtraBadge>{item.badge}</ExtraBadge>
                        </ExtraMeta>
                        <ExtraDesc>{item.desc}</ExtraDesc>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: 2 }}>
                          {expandedCard !== i ? (
                            <>
                              <ExtraTags>
                                {item.tags.slice(0, 3).map((tag, j) => (
                                  <span key={j} style={{ ...tagStyle, fontSize: '0.75rem', padding: '2px 9px' }}>{tag}</span>
                                ))}
                              </ExtraTags>
                              <ExtraTags>
                                {item.tags.slice(3, 5).map((tag, j) => (
                                  <span key={j} style={{ ...tagStyle, fontSize: '0.75rem', padding: '2px 9px' }}>{tag}</span>
                                ))}
                                {item.tags.length > 5 && (
                                  <span
                                    style={{ ...tagStyle, fontSize: '0.75rem', padding: '2px 9px', cursor: 'pointer', background: '#6c4ccf', color: '#fff', fontWeight: 600 }}
                                    onClick={() => setExpandedCard(i)}
                                  >
                                    +{item.tags.length - 5}
                                  </span>
                                )}
                              </ExtraTags>
                            </>
                          ) : (
                            <>
                              {item.tags.map((tag, j) => (
                                <ExtraTags key={j}>
                                  <span style={{ ...tagStyle, fontSize: '0.75rem', padding: '2px 9px' }}>{tag}</span>
                                </ExtraTags>
                              ))}
                              <ExtraTags>
                                <span
                                  style={{ ...tagStyle, fontSize: '0.75rem', padding: '2px 9px', cursor: 'pointer', background: '#222', color: '#fff', fontWeight: 600 }}
                                  onClick={() => setExpandedCard(null)}
                                >
                                  Show less
                                </span>
                              </ExtraTags>
                            </>
                          )}
                        </div>
                      </div>
                    </ExtraCard>
                  </motion.div>
                ))}
              </ExtraGrid>
              <motion.div
                initial={{ opacity: 0, x: 40, y: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 30, duration: 1.1 }}
                viewport={{ amount: 0.2 }}
              >
                <div style={{ textAlign: 'center', marginTop: '2.7rem', color: '#bdb7d6', fontSize: '1.13rem' }}>
                  Have a look at my photography profile at
                  <a href="#" style={{ color: '#ff6b81', fontWeight: 600, textDecoration: 'none', margin: '0 0.3em' }}>500px</a>
                  and
                  <a href="https://www.instagram.com/kissse.jpg?igsh=MXBrNXZnaWR1czhvMA==" style={{ color: '#ff6b81', fontWeight: 600, textDecoration: 'none', margin: '0 0.3em' }} target="_blank" rel="noopener noreferrer">insta</a>
                  <br />
                  <span style={{ color: '#ff1744', fontStyle: 'italic', fontSize: '2.1rem', fontWeight: 900, fontFamily: 'Montserrat, cursive, sans-serif', letterSpacing: '0.04em' }}>kisse.jpg</span>
                </div>
              </motion.div>
            </div>
          </Section>
        </FadeInContent>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, amount: 0.2 }}>
        <FadeInContent show={showContent} delay={2000}>
          <Section id="contact" fullscreen style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', marginLeft: 'clamp(2rem, 15vw, 17rem)', maxWidth: 1200, width: '100%', marginRight: 'auto', marginTop: 0, padding: 0 }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '3.5rem' }}>
              <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
                <motion.div
                  initial={{ opacity: 0, x: -80, scale: 0.92 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 38, duration: 2.1 }}
                  viewport={{ amount: 0.2 }}
                >
                  <ContactPanel onSubmit={handleContactSubmit}>
                    <ContactSubheading>GET IN TOUCH</ContactSubheading>
                    <ContactHeading>Contact Me<span style={{ color: '#ff1744' }}>.</span></ContactHeading>
                    <ContactForm style={{ gap: '1.2rem', textAlign: 'left' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                        <label style={{ color: '#fff', fontWeight: 500, marginBottom: 4, fontSize: '0.93rem', fontFamily: 'system-ui, sans-serif', textAlign: 'left' }}>Your Name</label>
                        <Input name="name" value={form.name} onChange={handleFormChange} type="text" placeholder="Insert Your name here..." required />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                        <label style={{ color: '#fff', fontWeight: 500, marginBottom: 4, fontSize: '0.93rem', fontFamily: 'system-ui, sans-serif', textAlign: 'left' }}>Email Address</label>
                        <Input name="email" value={form.email} onChange={handleFormChange} type="email" placeholder="What's your email address?" required />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                        <label style={{ color: '#fff', fontWeight: 500, marginBottom: 4, fontSize: '0.93rem', fontFamily: 'system-ui, sans-serif', textAlign: 'left' }}>Your Message</label>
                        <Textarea name="message" value={form.message} onChange={handleFormChange} placeholder="What you want to say...?" required />
                      </div>
                      <SubmitButton type="submit">{sending ? 'Sending...' : 'Ping'}</SubmitButton>
                      {result && <p>{result}</p>}
                    </ContactForm>
                  </ContactPanel>
                </motion.div>
              </div>
              <div style={{ flex: '1 1 0', minWidth: 0, minHeight: '400px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Canvas camera={{ position: [0, 1.2, 4.5], fov: 45 }} style={{ width: '100%', height: '100%', background: 'none' }}>
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[2, 4, 2]} intensity={0.7} />
                  <Suspense fallback={null}>
                    <HoveringSpaceRobot scale={1.6} />
                  </Suspense>
                </Canvas>
                {/* Add a second robot in the center of the empty part (centered in empty section, larger viewing window) */}
                <div style={{ position: 'absolute', left: '55%', top: '50%', transform: 'translate(-50%, -50%)', width: '420px', height: '420px', pointerEvents: 'none' }}>
                  <Canvas camera={{ position: [0, 1.2, 4.5], fov: 45 }} style={{ width: '100%', height: '100%', background: 'none' }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[2, 4, 2]} intensity={0.7} />
                    <Suspense fallback={null}>
                      <HoveringSpaceRobot scale={0.55} fullRange={true} />
                    </Suspense>
                  </Canvas>
                </div>
              </div>
            </div>
          </Section>
        </FadeInContent>
      </motion.div>
    </>
  );
}

function TypewriterAnimation() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (typing) {
      if (charIndex < typewriterWords[wordIndex].length) {
        timeout = setTimeout(() => {
          setDisplayed(typewriterWords[wordIndex].slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 70);
      } else {
        timeout = setTimeout(() => setTyping(false), 1200);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayed(typewriterWords[wordIndex].slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 30);
      } else {
        timeout = setTimeout(() => {
          setWordIndex((wordIndex + 1) % typewriterWords.length);
          setTyping(true);
        }, 400);
      }
    }
    return () => clearTimeout(timeout);
  }, [charIndex, typing, wordIndex]);
  useEffect(() => {
    setCharIndex(0);
    setDisplayed('');
    setTyping(true);
  }, [wordIndex]);
  return (
    <HomeHeroTypewriter>
      {displayed}
      <span className="typewriter-cursor">|</span>
    </HomeHeroTypewriter>
  );
} 

const tagStyle = {
  background: 'rgba(255,255,255,0.08)',
  color: '#eae6ff',
  borderRadius: '0.7rem',
  padding: '4px 13px',
  fontSize: '0.93rem',
  fontWeight: 500,
  marginBottom: 2,
  display: 'inline-block',
}; 

// Add a flex row container for image and heading
const ExtraTopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-bottom: 4px;
`;

// Helper to generate random popout transforms
const getRandomPopTransform = () => {
  // Randomize X and Y rotation between -18 and 18 degrees, and Z translation between 24 and 40px
  const rotX = (Math.random() * 36 - 18).toFixed(1);
  const rotY = (Math.random() * 36 - 18).toFixed(1);
  const transZ = (Math.random() * 16 + 24).toFixed(1);
  return `scale(1.38) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${transZ}px)`;
};

const skillList = [
  { name: 'Python', src: '/skills/python.svg' },
  { name: 'JavaScript', src: '/skills/javascript.svg' },
  { name: 'HTML5', src: '/skills/html5.svg' },
  { name: 'CSS3', src: '/skills/css3.svg' },
  { name: 'Node.js', src: '/skills/nodejs.svg' },
  { name: 'Express.js', src: '/skills/express.svg' },
  { name: 'PostgreSQL', src: '/skills/postgresql.svg' },
  { name: 'MongoDB', src: '/skills/mongodb.svg' },
  { name: 'Git', src: '/skills/git.svg' },
  { name: 'GitHub', src: '/skills/github.svg' },
  { name: 'Bootstrap', src: '/skills/bootstrap.svg' },
];

// Add a new styled component for the row:
const ProjectMetaRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 0 0.5rem 0;
  justify-content: flex-start;
  width: 100%;
`;