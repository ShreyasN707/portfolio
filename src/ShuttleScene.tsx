import PortfolioMain from './PortfolioMain';
import React, { useRef, Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import styled, { keyframes } from 'styled-components';

// Animated filter overlay for the machine scene
const AnimatedFilter = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 2;
  mix-blend-mode: lighten;
  background: repeating-linear-gradient(
    180deg,
    transparent 0px,
    transparent 7px,
    #00ff00 7px,
    #00ff00 9px,
    transparent 9px,
    transparent 16px
  );
  animation: scanlineMove 0.25s linear infinite;
  opacity: 0.18;
  @keyframes scanlineMove {
    0% { background-position-y: 0; }
    100% { background-position-y: 16px; }
  }
`;

function printSceneGraph(object: any, depth = 0) {
  const indent = ' '.repeat(depth * 2);
  console.log(`${indent}${object.type} - ${object.name || '(no name)'}`);
  if (object.children) {
    object.children.forEach((child: any) => printSceneGraph(child, depth + 1));
  }
}

const MachineModel = React.memo(({ onClick, onLoad, onError }: { 
  onClick: () => void;
  onLoad?: () => void;
  onError?: () => void;
}) => {
  const { scene } = useGLTF('/machine.glb');
  const ref = useRef<THREE.Object3D>(null);
  
  React.useEffect(() => {
    if (scene && onLoad) {
      onLoad();
    }
  }, [scene, onLoad]);
  
  React.useEffect(() => {
    if (ref.current && onLoad) {
      onLoad();
    }
  }, [onLoad]);
  
  return (
    <primitive ref={ref} object={scene} scale={1.2} position={[0, 0, 0]} onClick={onClick} />
  );
});

const FlyingPlatform = ({ children }: { children: React.ReactNode }) => {
  // Booster positions (relative to platform center)
  const boosters: [number, number, number][] = [
    [1.2, -0.45, 1.2],
    [-1.2, -0.45, 1.2],
    [-1.2, -0.45, -1.2],
    [1.2, -0.45, -1.2],
  ];
  return (
    <group position={[0, -0.2, 0]}>
      {/* Disk platform */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshStandardMaterial color="#e6e6ef" />
      </mesh>
      {/* Boosters */}
      {boosters.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 24]} />
            <meshStandardMaterial color="#b0b0c0" />
          </mesh>
          {/* Flame/thrust */}
          <mesh position={[0, -0.7, 0]}>
            <coneGeometry args={[0.13, 0.38, 18]} />
            <meshBasicMaterial color="#00cfff" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
      {/* Children (machine) */}
      <group position={[0, 0.25, 0]}>{children}</group>
    </group>
  );
};

const signalPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0,255,180,0.7); }
  70% { box-shadow: 0 0 16px 8px rgba(0,255,180,0.15); }
  100% { box-shadow: 0 0 0 0 rgba(0,255,180,0.0); }
`;

const SignalBox = styled.div`
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -38%);
  background: rgba(10, 10, 10, 0.82);
  color: #eafffa;
  padding: 1.3rem 2.5rem 1.1rem 2.5rem;
  border-radius: 18px;
  font-size: 1.18rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  z-index: 100;
  border: 2.5px solid #222;
  box-shadow: 0 0 24px 0 #000a;
  display: flex;
  align-items: center;
  gap: 2.2rem;
  letter-spacing: 0.01em;
`;

const BackButton = styled.button`
  font-size: 1.1rem;
  font-family: inherit;
  background: #222;
  color: #eafffa;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 1.2rem;
  margin-right: 1.2rem;
  align-self: flex-start;
  transition: background 0.2s;
  &:hover {
    background: #444;
  }
`;

const CodeBox = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  background: rgba(30,30,30,0.7);
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  box-shadow: 0 2px 12px 0 #222a;
`;

const CodeInput = styled.input`
  font-size: 1.2rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  border: 2px solid #444;
  border-radius: 6px;
  background: #181c1f;
  color: #eafffa;
  padding: 0.3rem 0.7rem;
  width: 3.2rem;
  text-align: center;
  outline: none;
`;

const CodeButton = styled.button`
  font-size: 1.1rem;
  font-family: inherit;
  background: #222;
  color: #eafffa;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #444;
  }
`;

const SignalIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 0.7rem;
  font-size: 1.7rem;
  color: #00ffb4;
  filter: drop-shadow(0 0 6px #00ffb4);
`;

const SignalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const SignalNumbers = styled.div`
  display: flex;
  gap: 0.7rem;
  font-size: 1.25rem;
  font-family: inherit;
  margin: 0.2rem 0 0.4rem 0;
`;

const BgGradient = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, #f9f7f1 0%, #eceae2 55%, #d6d6db 100%);
`;

const CalculatorBox = styled.div`
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -38%);
  background: rgba(20, 20, 20, 0.92);
  color: #eafffa;
  padding: 2.2rem 2.5rem 2.2rem 2.5rem;
  border-radius: 18px;
  font-size: 1.18rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  z-index: 100;
  border: 2.5px solid #222;
  box-shadow: 0 0 24px 0 #000a;
  display: flex;
  align-items: center;
  gap: 2.2rem;
  letter-spacing: 0.01em;
`;

const CalcPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.1rem;
`;

const CalcScreen = styled.div`
  background: #181c1f;
  color: #eafffa;
  border-radius: 8px;
  border: 2px solid #444;
  font-size: 1.4rem;
  padding: 0.7rem 1.2rem;
  min-width: 7.5rem;
  text-align: right;
  margin-bottom: 0.7rem;
`;

const CalcKeys = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 2.5rem);
  gap: 0.5rem;
`;

const CalcKey = styled.button`
  font-size: 1.2rem;
  font-family: inherit;
  background: #232323;
  color: #eafffa;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 0;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #444;
  }
`;

const CalcBackButton = styled.button`
  font-size: 1.1rem;
  font-family: inherit;
  background: #222;
  color: #eafffa;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 1.2rem;
  margin-right: 1.2rem;
  align-self: flex-start;
  transition: background 0.2s;
  &:hover {
    background: #444;
  }
`;

const SimplePopup = styled.div`
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -38%);
  background: rgba(10, 10, 10, 0.82);
  color: #eafffa;
  padding: 2.2rem 2.5rem 2.2rem 2.5rem;
  border-radius: 18px;
  font-size: 1.18rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  z-index: 100;
  border: 2.5px solid #222;
  box-shadow: 0 0 24px 0 #000a;
  display: flex;
  align-items: center;
  gap: 2.2rem;
  letter-spacing: 0.01em;
`;

const PopupText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-width: 15rem;
`;

const PopupCodeBox = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  background: rgba(30,30,30,0.7);
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  box-shadow: 0 2px 12px 0 #222a;
`;

const PopupCodeInput = styled.input`
  font-size: 1.2rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  border: 2px solid #444;
  border-radius: 6px;
  background: #181c1f;
  color: #eafffa;
  padding: 0.3rem 0.7rem;
  width: 3.2rem;
  text-align: center;
  outline: none;
`;

const PopupCodeButton = styled.button`
  font-size: 1.1rem;
  font-family: inherit;
  background: #222;
  color: #eafffa;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #444;
  }
`;

const ControlPanel = styled.div`
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -38%);
  background: linear-gradient(180deg, rgba(20,20,20,0.95) 80%, #181c1f 100%);
  color: #eafffa;
  padding: 1.3rem 1.5rem 1.3rem 1.5rem;
  border-radius: 18px;
  font-size: 1.08rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  z-index: 100;
  border: 2.5px solid #222;
  box-shadow: 0 0 24px 0 #000a;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  letter-spacing: 0.01em;
  min-width: 320px;
  border-top: 4px solid #333;
  border-bottom: 4px solid #333;
  box-shadow: 0 0 32px 0 #000b, 0 2px 0 0 #222 inset;
`;

const PanelLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 11rem;
  border-right: 2px solid #222;
  padding-right: 1.2rem;
  position: relative;
  font-family: 'Fira Mono', 'Consolas', 'Menlo', 'Monaco', monospace;
  color: rgba(255,255,255,0.85);
  height: 100%;
`;

const HintIcon = styled.button`
  background: #232323;
  border: 2px solid #00ffb4;
  color: #fff;
  font-size: 1.1rem;
  font-family: inherit;
  border-radius: 50%;
  width: 1.7rem;
  height: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s, background 0.2s;
  box-shadow: 0 1px 4px 0 #00ffb455;
  margin-left: auto;
  margin-top: 1.2rem;
  &:hover { opacity: 1; background: #181c1f; }
`;

const HintPopup = styled.div`
  position: absolute;
  left: 0;
  bottom: -3.2rem;
  background: #fff;
  color: #222;
  font-family: 'Fira Mono', 'Consolas', monospace;
  font-size: 1.08rem;
  border-radius: 8px;
  padding: 0.7rem 1.3rem;
  box-shadow: 0 2px 12px 0 #222a;
  border: 2px solid #00ffb4;
  z-index: 200;
  pointer-events: none;
`;

const PanelIndicators = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
`;

const IndicatorDot = styled.div<{ color: string }>`
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: ${({ color }) => color};
  box-shadow: 0 0 8px 0 ${({ color }) => color};
`;

const RetroOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 99999;
  mix-blend-mode: lighten;
  background:
    repeating-linear-gradient(180deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 7px),
    linear-gradient(90deg, rgba(0,255,128,0.025) 0%, rgba(0,0,0,0.035) 100%);
  filter: contrast(1.04) brightness(1.03) saturate(1.05) blur(0.15px);
`;

const TopTransitionText = styled.div`
  position: fixed;
  bottom: 2.2rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Anonymous Pro', 'Fira Mono', 'Consolas', monospace;
  font-size: 1.01rem;
  color: #111;
  background: none;
  padding: 0;
  border-radius: 0;
  letter-spacing: 0.04em;
  z-index: 200;
  font-weight: 600;
  box-shadow: 0 2px 8px 0 #0001;
  text-transform: uppercase;
`;

const RedOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(255,0,0,0.13);
  mix-blend-mode: lighten;
`;

const LoadingDotsContainer = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 100002;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Dot = styled.div`
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: #fff;
  opacity: 0.7;
  animation: dotBlink 1s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotBlink {
    0%, 80%, 100% { opacity: 0.7; }
    40% { opacity: 0.2; }
  }
`;

const LoadingText = styled.div`
  color: #fff;
  font-family: 'Fira Mono', 'Consolas', monospace;
  font-size: 1.1rem;
  opacity: 0.85;
  letter-spacing: 0.08em;
`;

const HeavyGlitchOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100001;
  mix-blend-mode: lighten;
  background:
    repeating-linear-gradient(180deg, #000 0 2px, transparent 2px 6px),
    repeating-linear-gradient(180deg, #2196f3 0 1px, transparent 1px 8px),
    repeating-linear-gradient(180deg, #00ffb4 0 1px, transparent 1px 12px),
    repeating-linear-gradient(180deg, #ff3b3b 0 1px, transparent 1px 16px);
  filter: contrast(1.35) brightness(1.22) saturate(1.35) blur(1.7px);
  animation: heavyGlitchAnim 0.09s steps(2) infinite;
  @keyframes heavyGlitchAnim {
    0% { filter: none; }
    20% { filter: blur(2.5px) brightness(1.3) contrast(1.5) saturate(1.5); }
    40% { filter: none; }
    60% { filter: blur(4.5px) brightness(1.7) contrast(2.5) saturate(2.5); }
    100% { filter: none; }
  }
`;

const ScreenDamageOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100003;
  background: none;
  mix-blend-mode: lighten;
  animation: damageFadeIn 1.5s linear forwards;
  @keyframes damageFadeIn {
    0% { opacity: 0; }
    10% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  &::before, &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }
  &::before {
    background:
      repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 8px),
      repeating-linear-gradient(180deg, rgba(0,255,128,0.13) 0 1px, transparent 1px 12px),
      repeating-linear-gradient(180deg, rgba(33,150,243,0.13) 0 1px, transparent 1px 16px),
      repeating-linear-gradient(180deg, rgba(255,59,59,0.13) 0 1px, transparent 1px 20px);
    opacity: 0.7;
    filter: blur(0.7px);
    animation: damageLines 0.13s steps(2) infinite;
  }
  &::after {
    background:
      repeating-linear-gradient(90deg, rgba(0,0,0,0.13) 0 8px, transparent 8px 16px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 8px);
    opacity: 0.5;
    filter: blur(1.2px);
    animation: damageBlocks 0.09s steps(2) infinite;
  }
  @keyframes damageLines {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  @keyframes damageBlocks {
    0% { opacity: 0.5; }
    50% { opacity: 0.9; }
    100% { opacity: 0.5; }
  }
`;

const BlackStripsOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100003;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  animation: stripsIn 1.5s cubic-bezier(0.7,0.1,0.9,0.9) forwards;
  @keyframes stripsIn {
    0% { opacity: 0; }
    10% { opacity: 1; }
    100% { opacity: 1; }
  }
`;

const BlackStrip = styled.div<{ delay: number; height: number; left: number; width: number }>`
  position: absolute;
  left: ${({ left }) => left}%;
  width: ${({ width }) => width}vw;
  height: ${({ height }) => height}vh;
  background: #111;
  opacity: 0;
  animation: stripAppear 1.5s cubic-bezier(0.7,0.1,0.9,0.9) forwards, blink 0.18s steps(2) infinite;
  animation-delay: ${({ delay }) => delay}s;
  @keyframes stripAppear {
    0% { opacity: 0; transform: translateY(-100%); }
    30% { opacity: 0.9; transform: translateY(0); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.7); }
  }
`;

const FlickerOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100005;
  background: #111;
  opacity: 0;
  animation: flickerOnOff 2s steps(2) infinite;
  @keyframes flickerOnOff {
    0%, 100% { opacity: 0; }
    10% { opacity: 0.7; }
    20% { opacity: 0; }
    30% { opacity: 0.8; }
    40% { opacity: 0; }
    50% { opacity: 0.9; }
    60% { opacity: 0; }
    70% { opacity: 0.7; }
    80% { opacity: 0; }
    90% { opacity: 1; }
  }
`;

const BlackoutOverlay = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 100006;
  background: #111;
  opacity: 1;
`;

const TerminalWindow = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #181c1f;
  color: #eafffa;
  font-family: 'Fira Mono', 'Consolas', monospace;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const TerminalInner = styled.div`
  background: #23272e;
  border-radius: 10px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: 2.2rem 2.5rem;
  min-width: 420px;
  max-width: 90vw;
  min-height: 220px;
  border: 1.5px solid #333;
`;

const TerminalLine = styled.div`
  margin-bottom: 0.3em;
  white-space: pre;
  font-size: 1.08rem;
`;

const TerminalPrompt = styled.span`
  color: #00ffb4;
`;

const TerminalCursor = styled.span`
  display: inline-block;
  width: 1ch;
  color: #00ffb4;
  animation: blink 1s steps(1) infinite;
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const CliTerminal = styled.div`
  position: fixed;
  left: 50%;
  bottom: 2.5rem;
  transform: translateX(-50%);
  background: #181c1f;
  color: #eafffa;
  font-family: 'Fira Mono', 'Consolas', monospace;
  font-size: 1.08rem;
  border-radius: 10px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  padding: 1.2rem 2.2rem 1.5rem 2.2rem;
  min-width: 340px;
  max-width: 90vw;
  z-index: 10000;
`;

const CliLine = styled.div`
  margin-bottom: 0.2em;
  white-space: pre;
  font-size: 1.08rem;
`;

const CliPrompt = styled.span`
  color: #00ffb4;
`;

const CliComment = styled.div`
  color: #7fffa7;
  font-size: 0.98rem;
  margin-top: 0.7em;
  opacity: 0.7;
`;

const FullscreenCli = styled.div`
  position: fixed;
  inset: 0;
  background: #181c1f;
  color: #eafffa;
  font-family: 'Fira Mono', 'Consolas', monospace;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
`;

const FullscreenCliInner = styled.div`
  background: #23272e;
  border-radius: 10px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  padding: 2.2rem 2.5rem;
  min-width: 420px;
  max-width: 90vw;
  min-height: 220px;
  border: 1.5px solid #333;
`;

const FullscreenCliLine = styled.div`
  margin-bottom: 0.2em;
  white-space: pre;
  font-size: 1.08rem;
`;

const FullscreenCliPrompt = styled.span`
  color: #00ffb4;
`;

const FullscreenCliComment = styled.div`
  color: #7fffa7;
  font-size: 0.98rem;
  margin-top: 0.7em;
  opacity: 0.7;
`;

const FullscreenCliCursor = styled.span`
  display: inline-block;
  width: 1ch;
  color: #00ffb4;
  animation: blink 1s steps(1) infinite;
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const WhatsAppPopup = styled.div`
  position: absolute;
  left: 50%;
  bottom: 120%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.04);
  color: #fff;
  padding: 0.01rem 0.04rem;
  border-radius: 1.3rem;
  font-size: 0.22rem;
  font-family: system-ui, Arial, sans-serif;
  font-weight: 400;
  box-shadow: none;
  border: 0.5px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(28px);
  z-index: 10;
  opacity: 0.97;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.35s;
  &::after {
    content: '';
    position: absolute;
    left: 1.5px;
    top: 100%;
    width: 0;
    height: 0;
    border-left: 1.5px solid transparent;
    border-right: 1.5px solid transparent;
    border-top: 1.5px solid rgba(255,255,255,0.13);
    filter: blur(0.5px);
  }
  @media (max-width: 600px) {
    font-size: 0.36rem;
    padding: 0.04rem 0.13rem;
    border-radius: 0.7rem;
    &::after {
      left: 1px;
      border-left: 1px solid transparent;
      border-right: 1px solid transparent;
      border-top: 1px solid rgba(255,255,255,0.13);
    }
  }
`;

const popupMessages = [
  'Get in touch!',
  'Go on!',
  'Say hi!',
  'Ping me!',
  'Let\'s connect!',
  'Drop a message!',
  'Contact me!',
  'Reach out!',
];

// CarModel for car.glb
const CarModel = React.memo((props: any) => {
  const { scene } = useGLTF('/car.glb');
  console.log('CarModel loaded', scene);
  React.useEffect(() => {
    printSceneGraph(scene);
  }, [scene]);
  // Try to override material for visibility
  React.useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: '#00ffb4' });
      }
    });
  }, [scene]);
  return <primitive object={scene} {...props} />;
});
useGLTF.preload('/car.glb');

function CameraFocus({ focus }: { focus: boolean }) {
  const { camera } = useThree();
  const start = new THREE.Vector3(-3, 1.5, 5);
  const target = new THREE.Vector3(0, 1.2, 6.5);
  const look = new THREE.Vector3(0, 1.2, 0);
  useFrame(() => {
    if (focus) {
      camera.position.lerp(target, 0.08);
      camera.lookAt(look);
    }
  });
  return null;
}

const DroneModel = React.memo(({ position, rotationY }: { position: [number, number, number], rotationY?: number }) => {
  const { scene } = useGLTF('/drone.glb');
  useFrame(() => {
    scene.traverse((child) => {
      if (child.name.toLowerCase().includes('propeller') || child.name.toLowerCase().includes('rotor')) {
        child.rotation.y += 0.3;
      }
    });
  });
  return <primitive object={scene} scale={0.7} position={position} rotation={rotationY ? [0, rotationY, 0] : undefined} />;
});

const RobotModel = React.memo(({ position, scale = 1.1 }: { position: [number, number, number]; scale?: number | [number, number, number] }) => {
  const { scene } = useGLTF('/robot.glb');
  return <primitive object={scene} scale={scale} position={position} />;
});

const SpaceRobotModel = React.memo(({ position, scale = 1.1 }: { position: [number, number, number]; scale?: number | [number, number, number] }) => {
  const { scene } = useGLTF('/spacerobot.glb');
  return <primitive object={scene} scale={scale} position={position} />;
});

const CirclingDrone = () => {
  const t = useRef(0);
  const [pos, setPos] = useState<[number, number, number]>([0, 0, 0]);
  const axis = useRef<[number, number, number]>([0, 1, 0]);
  const targetAxis = useRef<[number, number, number]>([0, 1, 0]);
  const axisChangeTimer = useRef(0);
  useFrame((_, delta) => {
    t.current += delta;
    // Smoothly interpolate axis
    for (let i = 0; i < 3; i++) {
      axis.current[i] += (targetAxis.current[i] - axis.current[i]) * 0.04;
    }
    // Randomly pick a new target axis every 2-4 seconds
    axisChangeTimer.current += delta;
    if (axisChangeTimer.current > 2 + Math.random() * 2) {
      let x = Math.random() - 0.5;
      let y = Math.random() * 0.5 + 0.7;
      let z = Math.random() - 0.5;
      const len = Math.sqrt(x*x + y*y + z*z);
      targetAxis.current = [x/len, y/len, z/len];
      axisChangeTimer.current = 0;
    }
    // Orbit around the current axis
    const angle = t.current * 0.6;
    const r = 4;
    const [ax, ay, az] = axis.current;
    const up = [0, 0, r];
    const c = Math.cos(angle), s = Math.sin(angle), C = 1 - c;
    const x = (c + ax*ax*C)*up[0] + (ax*ay*C - az*s)*up[1] + (ax*az*C + ay*s)*up[2];
    const y = (ay*ax*C + az*s)*up[0] + (c + ay*ay*C)*up[1] + (ay*az*C - ax*s)*up[2];
    const z = (az*ax*C - ay*s)*up[0] + (az*ay*C + ax*s)*up[1] + (c + az*az*C)*up[2];
    const yFinal = 1.2 + y + Math.sin(t.current * 1.2) * 0.5 + Math.sin(t.current * 0.7) * 0.2;
    // Smoothly interpolate position
    setPos(prev => [
      prev[0] + (x - prev[0]) * 0.15,
      prev[1] + (yFinal - prev[1]) * 0.15,
      prev[2] + (z - prev[2]) * 0.15
    ]);
  });
  return <DroneModel position={pos} rotationY={undefined} />;
};

const HoveringSpaceRobot = ({ scale = 0.5, fullRange = false }: { scale?: number, fullRange?: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  // For random smooth movement
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  // WhatsApp popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState(popupMessages[0]);
  useEffect(() => {
    if (!fullRange) return;
    let running = true;
    function pickNewTarget() {
      if (!running) return;
      setTarget({
        x: (Math.random() * 2 - 1) * 1.1,
        y: (Math.random() * 2 - 1) * 0.65
      });
      setTimeout(pickNewTarget, 2600 + Math.random() * 1200);
    }
    pickNewTarget();
    // WhatsApp popup randomizer
    function popupLoop() {
      if (!running) return;
      setTimeout(() => {
        setPopupText(popupMessages[Math.floor(Math.random() * popupMessages.length)]);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
        popupLoop();
      }, 3000 + Math.random() * 4000);
    }
    popupLoop();
    return () => { running = false; };
  }, [fullRange]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    let x, y, z;
    if (fullRange) {
      // Cinematic: blend smooth random walk with a slow orbital path
      const orbitRadiusX = 0.45;
      const orbitRadiusY = 0.22;
      const orbitSpeed = 0.18;
      const orbitX = Math.cos(t * orbitSpeed) * orbitRadiusX;
      const orbitY = Math.sin(t * orbitSpeed) * orbitRadiusY;
      // Smoother interpolation to random target
      pos.current.x += (target.x - pos.current.x) * 0.012;
      pos.current.y += (target.y - pos.current.y) * 0.012;
      x = pos.current.x + orbitX;
      y = pos.current.y + orbitY;
      y += Math.sin(t * 1.7) * 0.09;
      z = Math.cos(t * 0.5) * 0.45;
      // Clamp for larger Canvas (2.5x2.5 units), always keep robot fully visible
      const canvasHalf = 1.25;
      const robotHalfWidth = scale * 0.6;
      const robotHalfHeight = scale * 0.8;
      const maxX = canvasHalf - robotHalfWidth;
      const minX = -canvasHalf + robotHalfWidth;
      const maxY = canvasHalf - robotHalfHeight;
      const minY = -canvasHalf + robotHalfHeight;
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
    } else {
      x = Math.sin(t * 0.6) * 0.85;
      y = Math.sin(t * 0.9) * 0.32 - 0.1;
      y += Math.sin(t * 1.7) * 0.13;
      z = Math.cos(t * 0.5) * 0.45;
      // Clamp for normal Canvas
      const maxX = 1.25 - scale * 0.6;
      const minX = -1.25 + scale * 0.6;
      const maxY = 1.1 - scale * 0.8;
      const minY = -1.1 + scale * 0.8;
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
    }
    if (ref.current) {
      ref.current.position.x = x;
      ref.current.position.y = y;
      ref.current.position.z = z;
      ref.current.rotation.y = Math.sin(t * 0.7) * 0.5;
      ref.current.rotation.x = Math.cos(t * 0.5) * 0.13;
    }
  });
  return (
    <group ref={ref}>
      <SpaceRobotModel position={[0, 0, 0]} scale={scale} />
      {/* WhatsApp popup for fullRange robot */}
      {fullRange && showPopup && (
        <Html center style={{ pointerEvents: 'none', zIndex: 10 }} distanceFactor={18} position={[0, scale * 1.25, 0]}>
          <WhatsAppPopup>{popupText}</WhatsAppPopup>
        </Html>
      )}
    </group>
  );
};

const ShuttleScene = () => {
  const [focus, setFocus] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [code, setCode] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [hidePopup, setHidePopup] = useState(false);
  const [flickerOn, setFlickerOn] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  // Only lock controls when focused
  const controlsEnabled = !focus;
  const handleFocus = React.useCallback(() => {
    setFocus(true);
  }, []);
  // No handleBack, user must click machine to focus

  React.useEffect(() => {
    if (showHint) {
      const timeout = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [showHint]);

  React.useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    if (showLoading) {
      setHidePopup(true);
      setFlickerOn(false);
      setBlackout(false);
      // Flicker off for 0.3s at 0.5s, 1.0s, 1.5s
      timeouts.push(setTimeout(() => setFlickerOn(true), 500));
      timeouts.push(setTimeout(() => setFlickerOn(false), 800));
      timeouts.push(setTimeout(() => setFlickerOn(true), 1000));
      timeouts.push(setTimeout(() => setFlickerOn(false), 1300));
      timeouts.push(setTimeout(() => setFlickerOn(true), 1500));
      timeouts.push(setTimeout(() => setFlickerOn(false), 1800));
      // Blackout for 0.4s before portfolio appears
      timeouts.push(setTimeout(() => setBlackout(true), 1700));
      timeouts.push(setTimeout(() => setBlackout(false), 2100));
      // End loading and show portfolio after blackout
      timeouts.push(setTimeout(() => {
        setShowLoading(false);
        setShowPortfolio(true);
      }, 2100));
    }
    return () => { timeouts.forEach(clearTimeout); };
  }, [showLoading]);

  // Show CLI intro on load, then hide after 2.5s
  const [showCli, setShowCli] = useState(true);
  React.useEffect(() => {
    if (showCli) {
      const timeout = setTimeout(() => setShowCli(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [showCli]);

  // Add timeout for model loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!modelLoaded && !modelError) {
        setModelError(true);
      }
    }, 30000); // 30 second timeout
    
    return () => clearTimeout(timeout);
  }, [modelLoaded, modelError]);

  // Generate random strips for the effect
  const renderBlackStrips = useCallback(() => {
    const strips = [];
    const numBars = 38;
    for (let i = 0; i < numBars; i++) {
      const delay = Math.random() * 1.7;
      const height = 2 + Math.random() * 5;
      const top = Math.random() * (100 - height);
      strips.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            width: '100vw',
            height: `${height}vh`,
            top: `${top}vh`,
            background: '#111',
            opacity: 0,
            animation: `barFlash 2s steps(1) forwards, blink 0.18s steps(2) infinite`,
            animationDelay: `${delay}s, 0s`,
            animationDuration: `0.12s, 0.18s`,
            zIndex: 100004,
          }}
        />
      );
    }
    return strips;
  }, []);

  // Add the keyframes for barAppear, barDisappear, and blink to the global style
  if (typeof window !== 'undefined' && !document.getElementById('bar-appear-keyframes')) {
    const style = document.createElement('style');
    style.id = 'bar-appear-keyframes';
    style.innerHTML = `
      @keyframes barFlash {
        0% { opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes blink {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.7); }
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <>
      {showPortfolio ? (
        <PortfolioMain />
      ) : (
        <div style={{ width: '100vw', height: '100vh', background: '#f9f7f1', position: 'relative' }}>
          {/* Loading screen */}
          {!modelLoaded && !modelError && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#f9f7f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              color: '#333',
              fontSize: '1.2rem',
              fontFamily: 'monospace'
            }}>
              Loading 3D Models...
            </div>
          )}
          
          {/* Error screen */}
          {modelError && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#f9f7f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              color: '#ff3333',
              fontSize: '1.2rem',
              fontFamily: 'monospace',
              textAlign: 'center',
              padding: '2rem'
            }}>
              Error loading 3D models. Please refresh the page.
            </div>
          )}
          
          {(!focus) && (
            <TopTransitionText>Click the reactor to activate Portfolio</TopTransitionText>
          )}
          <RetroOverlay />
          <BgGradient />
          <AnimatedFilter />
          <Canvas camera={{ position: [-3, 1.5, 7], fov: 55 }} dpr={[1, 2]} shadows
            onPointerMissed={() => setFocus(false)}>
            <ambientLight intensity={1.1} />
            <directionalLight position={[10, 10, 10]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0002} />
            {/* Circular platform and soft shadow under the machine */}
            <mesh receiveShadow position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[2.5, 64]} />
              <meshStandardMaterial color="#e6e6ef" />
            </mesh>
            <mesh position={[0, -1.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[2.1, 64]} />
              <meshStandardMaterial color="#b0b0c0" transparent opacity={0.22} />
            </mesh>
            <Suspense fallback={null}>
              <CirclingDrone />
              <MachineModel 
                onClick={handleFocus} 
                onLoad={() => setModelLoaded(true)}
                onError={() => setModelError(true)}
              />
              <pointLight position={[0, 2, 2]} intensity={2} color={'#fff'} />
            </Suspense>
            <CameraFocus focus={focus} />
            <OrbitControls enablePan={!focus} enableZoom={!focus} enableRotate={!focus} />
          </Canvas>
          {showLoading && (
            <>
              <LoadingDotsContainer>
                <LoadingDots>
                  <Dot />
                  <Dot />
                  <Dot />
                </LoadingDots>
                <LoadingText>loading...</LoadingText>
              </LoadingDotsContainer>
              <BlackStripsOverlay>
                {renderBlackStrips()}
              </BlackStripsOverlay>
              {flickerOn && <FlickerOverlay />}
              {blackout && <BlackoutOverlay />}
            </>
          )}
          {focus && !hidePopup && (
            <ControlPanel>
              <PanelLeft>
                <HintIcon title="Show hint" onClick={() => setShowHint(true)}>?</HintIcon>
                {showHint && <HintPopup>Remember RGB?!</HintPopup>}
                <PanelIndicators>
                  <IndicatorDot color="#00ffb4" />
                  <IndicatorDot color="#ffb300" />
                  <IndicatorDot color="#ff3b3b" />
                </PanelIndicators>
                <span style={{ fontWeight: 600, fontSize: '1.15em', marginBottom: '0.5em' }}>
                  Hey! Use some brains
                </span>
                <span>
                  <span style={{ color: 'green', fontWeight: 700 }}>9</span>
                  <span style={{ color: 'red', fontWeight: 700, marginLeft: 8, marginRight: 8 }}>6</span>
                  <span style={{ color: '#2196f3', fontWeight: 700 }}>9</span>
                </span>
                <span style={{ opacity: 0.93, marginTop: '0.7em' }}>
                  These are <span style={{ fontWeight: 600 }}>coloured</span>. enter in order to reach my profile
                </span>
                <button style={{ marginTop: '1.2em', alignSelf: 'flex-start' }} onClick={() => setFocus(false)}>Back</button>
              </PanelLeft>
              <PopupCodeBox
                onSubmit={e => {
                  e.preventDefault();
                  if (code === '699') setShowLoading(true);
                }}
              >
                <PopupCodeInput
                  type="text"
                  placeholder="code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  disabled={showLoading}
                />
                <PopupCodeButton type="submit" disabled={showLoading}>Enter</PopupCodeButton>
              </PopupCodeBox>
            </ControlPanel>
          )}
        </div>
      )}
    </>
  );
};

export { RobotModel, SpaceRobotModel, HoveringSpaceRobot };
export default ShuttleScene; 