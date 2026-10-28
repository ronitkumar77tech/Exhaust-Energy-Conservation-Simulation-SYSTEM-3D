import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAppStore } from "../../store/useAppStore";
import { useEditStore } from "../../store/useEditStore";

const WIDTH = 25.6;
const HEIGHT = 6.25;
// Vertical lift keeps the board clear of the engine, power electronics, and battery.
const BOARD_LIFT = 2.0;
const BOARD_CENTER = [4.3, 7.85 + BOARD_LIFT, 0.45];
const MIC_CANVAS_POSITION = [818, 66];
const MIC_WORLD_POSITION = [
  BOARD_CENTER[0] + (MIC_CANVAS_POSITION[0] / 1536 - 0.5) * WIDTH,
  BOARD_CENTER[1] + (0.5 - MIC_CANVAS_POSITION[1] / 376) * HEIGHT,
];
const BOARD_SOCKET_Y = 5.9 + BOARD_LIFT;
const BOARD_SOCKETS = [
  [14.4, BOARD_SOCKET_Y, 0.62],
  [7.6, BOARD_SOCKET_Y, 0.62],
  [1.0, BOARD_SOCKET_Y, 0.62],
  [-5.8, BOARD_SOCKET_Y, 0.62],
];
const TELEMETRY = [
  { key: "engineRPM", label: "ENGINE RPM", unit: "RPM", initial: 2450, color: "#30f5ba", max: 6000 },
  { key: "exhaustTemperature", label: "EXHAUST TEMPERATURE", unit: "\u00B0C", initial: 520, color: "#ff624d", max: 800 },
  { key: "exhaustPressure", label: "EXHAUST PRESSURE", unit: "kPa", initial: 72, color: "#168fff", max: 150 },
  { key: "recoveredPower", label: "RECOVERED POWER", unit: "W", initial: 380, color: "#ffc928", max: 600 },
];
const SENSORS = [
  [16.3, 2.1, 2.1],
  [8.6, 1.1, 1.9],
  [4.6, 1.8, 1.65],
  [-8.4, 2.05, 1.4],
];
const FRAME_BARS = [
  { position: [BOARD_CENTER[0], BOARD_CENTER[1] + HEIGHT / 2 - 0.015, BOARD_CENTER[2] + 0.19], size: [WIDTH - 0.12, 0.035, 0.025] },
  { position: [BOARD_CENTER[0], BOARD_CENTER[1] - HEIGHT / 2 + 0.015, BOARD_CENTER[2] + 0.19], size: [WIDTH - 0.12, 0.035, 0.025] },
  { position: [BOARD_CENTER[0] - WIDTH / 2 + 0.015, BOARD_CENTER[1], BOARD_CENTER[2] + 0.19], size: [0.035, HEIGHT - 0.12, 0.025] },
  { position: [BOARD_CENTER[0] + WIDTH / 2 - 0.015, BOARD_CENTER[1], BOARD_CENTER[2] + 0.19], size: [0.035, HEIGHT - 0.12, 0.025] },
  { position: [BOARD_CENTER[0], BOARD_CENTER[1] + HEIGHT / 2 - 0.015, BOARD_CENTER[2] - 0.19], size: [WIDTH - 0.12, 0.035, 0.025] },
  { position: [BOARD_CENTER[0], BOARD_CENTER[1] - HEIGHT / 2 + 0.015, BOARD_CENTER[2] - 0.19], size: [WIDTH - 0.12, 0.035, 0.025] },
  { position: [BOARD_CENTER[0] - WIDTH / 2 + 0.015, BOARD_CENTER[1], BOARD_CENTER[2] - 0.19], size: [0.035, HEIGHT - 0.12, 0.025] },
  { position: [BOARD_CENTER[0] + WIDTH / 2 - 0.015, BOARD_CENTER[1], BOARD_CENTER[2] - 0.19], size: [0.035, HEIGHT - 0.12, 0.025] },
];

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawDashboard(canvas, values, history, micStatus, voiceMessage, pulse) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "rgba(3, 18, 23, .98)");
  bg.addColorStop(1, "rgba(4, 11, 17, .98)");
  roundedRect(ctx, 4, 4, w - 8, h - 8, 22);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(39, 247, 191, .88)";
  ctx.shadowColor = "rgba(0, 242, 190, .55)";
  ctx.shadowBlur = 22;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.font = "600 18px Consolas, monospace";
  ctx.fillStyle = "rgba(76, 221, 190, .72)";
  ctx.textAlign = "left";
    ctx.fillText("EXHAUST ENERGY RECOVERY  \u00B7  LIVE SYSTEMS", 30, 33);
  ctx.textAlign = "right";
  ctx.fillStyle = "#9aafb7";
  ctx.fillText("SIMULATION / DEMO", w - 30, 33);

  ctx.textAlign = "center";
  ctx.font = "italic 900 43px system-ui, sans-serif";
  ctx.fillStyle = "#42f7bb";
  ctx.shadowColor = "rgba(48, 245, 186, .65)";
  ctx.shadowBlur = 18;
  ctx.fillText("TURBO AI", w / 2 - 76, 80);
  ctx.shadowBlur = 0;

  // Canvas drawn microphone stays crisp at every camera zoom level.
  const [micX, micY] = MIC_CANVAS_POSITION;
  const micColor = micStatus === "listening" ? "#42f7bb"
    : micStatus === "denied" ? "#ff624d"
      : micStatus === "unsupported" ? "#ffc928" : "#83aaa5";
  ctx.save();
  ctx.strokeStyle = micColor;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = micColor;
  ctx.shadowBlur = micStatus === "listening" ? (pulse ? 22 : 9) : 6;
  ctx.beginPath();
  ctx.roundRect(micX - 6, micY - 12, 12, 21, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(micX, micY + 4, 12, 0.08 * Math.PI, 0.92 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(micX, micY + 16);
  ctx.lineTo(micX, micY + 22);
  ctx.moveTo(micX - 7, micY + 22);
  ctx.lineTo(micX + 7, micY + 22);
  ctx.stroke();
  if (micStatus !== "listening") {
    ctx.beginPath();
    ctx.moveTo(micX - 13, micY - 13);
    ctx.lineTo(micX + 13, micY + 13);
    ctx.stroke();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(micX + 36, 66, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#42f7bb";
  ctx.fill();
  ctx.textAlign = "left";
  ctx.font = "600 16px Consolas, monospace";
  ctx.fillStyle = "#789a99";
  ctx.fillText("INTELLIGENT ENERGY MONITOR", micX + 56, 71);
  if (micStatus === "listening" || micStatus === "denied" || micStatus === "unsupported" || voiceMessage) {
    const status = micStatus === "listening" ? "· LISTENING"
      : micStatus === "denied" ? "· MIC PERMISSION DENIED"
        : micStatus === "unsupported" ? "· VOICE INPUT UNSUPPORTED"
          : `· HEARD: ${voiceMessage}`;
    ctx.font = "600 12px Consolas, monospace";
    ctx.fillStyle = micColor;
    ctx.fillText(status, micX + 56, 88);
  }

  const margin = 24;
  const gap = 16;
  const top = 96;
  const cardH = 210;
  const cardW = (w - margin * 2 - gap * 3) / 4;
  TELEMETRY.forEach((item, index) => {
    const x = margin + index * (cardW + gap);
    const color = item.color;
    roundedRect(ctx, x, top, cardW, cardH, 18);
    ctx.fillStyle = "rgba(1, 10, 14, .92)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `${color}aa`;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "700 19px system-ui, sans-serif";
    ctx.fillStyle = "#d5e5e4";
    ctx.fillText(item.label, x + cardW / 2, top + 35);
    ctx.font = "800 48px system-ui, sans-serif";
    ctx.fillStyle = color;
    ctx.shadowColor = `${color}88`;
    ctx.shadowBlur = 15;
    ctx.fillText(String(values[item.key]), x + cardW / 2 - 14, top + 96);
    ctx.shadowBlur = 0;
    ctx.font = "700 19px Consolas, monospace";
    ctx.fillText(item.unit, x + cardW / 2 + 71, top + 94);

    const chartX = x + 16;
    const chartY = top + 145;
    const chartW = cardW - 32;
    ctx.strokeStyle = "rgba(171, 205, 205, .18)";
    ctx.lineWidth = 1;
    [0, 0.5, 1].forEach((ratio) => {
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + ratio * 28);
      ctx.lineTo(chartX + chartW, chartY + ratio * 28);
      ctx.stroke();
    });
    ctx.beginPath();
    history[item.key].forEach((value, pointIndex) => {
      const px = chartX + (pointIndex / (history[item.key].length - 1)) * chartW;
      const py = chartY + 28 - Math.min(25, (value / item.max) * 25);
      if (pointIndex) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";
    ctx.font = "14px Consolas, monospace";
    ctx.fillStyle = "#91a9aa";
    ctx.fillText("0", chartX, top + 195);
    ctx.textAlign = "center";
    ctx.fillText(String(Math.round(item.max / 2)), x + cardW / 2, top + 195);
    ctx.textAlign = "right";
    ctx.fillText(item.max.toLocaleString(), chartX + chartW, top + 195);
  });

  ctx.textAlign = "left";
  ctx.font = "600 15px Consolas, monospace";
  ctx.fillStyle = "#91a9aa";
    ctx.fillText("\u25CF  SIMULATED DEMO VALUES  \u00B7  NO HARDWARE SENSOR CONNECTED", 28, h - 18);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(76, 221, 190, .65)";
  ctx.fillText("ENGINEERING CONCEPT / 01", w - 28, h - 18);
}

export function TelemetryDashboard() {
  const isOrbiting = useAppStore((state) => state.isOrbiting);
  const isDragging = useEditStore((state) => state.isDragging);
  const opticalLightRef = useRef(null);
  const opticalGlow = useRef(0);
  const frameMaterials = useRef([]);
  const cableMaterials = useRef([]);
  const isAdjusting = isOrbiting || isDragging;
  const [micStatus, setMicStatus] = useState("inactive");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [pulse, setPulse] = useState(false);
  const recognitionRef = useRef(null);
  const [values, setValues] = useState(() => Object.fromEntries(TELEMETRY.map(({ key, initial }) => [key, initial])));
  const [history, setHistory] = useState(() => Object.fromEntries(TELEMETRY.map(({ key, initial }) => [key, Array.from({ length: 30 }, (_, i) => initial * (0.94 + Math.sin(i * 1.15) * 0.035))])));
  const canvas = useMemo(() => {
    const element = document.createElement("canvas");
    element.width = 1536;
    element.height = 376;
    return element;
  }, []);
  const texture = useMemo(() => {
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  }, [canvas]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValues((previous) => Object.fromEntries(TELEMETRY.map(({ key, initial }, index) => {
        const target = initial + Math.sin(Date.now() / 4500 + index) * initial * 0.025;
        return [key, Math.round(previous[key] + (target - previous[key]) * 0.24)];
      })));
    }, 1100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setHistory((previous) => Object.fromEntries(TELEMETRY.map(({ key }, index) => {
      const smallTrend = 1 + Math.sin(Date.now() / 1900 + index * 1.7) * 0.035;
      return [key, [...previous[key].slice(1), values[key] * smallTrend]];
    })));
  }, [values]);

  useEffect(() => {
    drawDashboard(canvas, values, history, micStatus, voiceMessage, pulse);
    texture.needsUpdate = true;
  }, [canvas, history, micStatus, pulse, texture, values, voiceMessage]);

  useEffect(() => {
    if (micStatus !== "listening") return undefined;
    const timer = window.setInterval(() => setPulse((previous) => !previous), 420);
    return () => window.clearInterval(timer);
  }, [micStatus]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  // A single eased value drives the attached light, double-sided frame, and sensor leads.
  useFrame((_, delta) => {
    if (!isAdjusting && opticalGlow.current < 0.001) {
      if (opticalGlow.current !== 0) {
        opticalGlow.current = 0;
        if (opticalLightRef.current) opticalLightRef.current.intensity = 1.2;
        frameMaterials.current.forEach((material) => {
          if (material) material.emissiveIntensity = 1.0;
        });
        cableMaterials.current.forEach((material, index) => {
          if (material) material.emissiveIntensity = index % 2 === 0 ? 0.75 : 1.15;
        });
      }
      return;
    }
    opticalGlow.current = THREE.MathUtils.damp(opticalGlow.current, isAdjusting ? 1 : 0, isAdjusting ? 8 : 3.2, delta);
    const glow = opticalGlow.current;
    if (opticalLightRef.current) opticalLightRef.current.intensity = 1.2 + glow * 15;
    frameMaterials.current.forEach((material) => {
      if (material) material.emissiveIntensity = 1.0 + glow * 4.5;
    });
    cableMaterials.current.forEach((material, index) => {
      if (material) material.emissiveIntensity = (index % 2 === 0 ? 0.75 : 1.15) + glow * 1.8;
    });
  });

  const toggleMicrophone = (event) => {
    event.stopPropagation();
    if (micStatus === "listening") {
      recognitionRef.current?.stop();
      setMicStatus("inactive");
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setMicStatus("unsupported");
      setVoiceMessage("");
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setVoiceMessage("");
      setMicStatus("listening");
    };
    recognition.onresult = (resultEvent) => {
      const transcript = resultEvent.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) setVoiceMessage(transcript.slice(0, 42));
    };
    recognition.onerror = (errorEvent) => {
      if (["not-allowed", "service-not-allowed", "audio-capture"].includes(errorEvent.error)) {
        setMicStatus("denied");
      } else if (errorEvent.error === "language-not-supported") {
        setMicStatus("unsupported");
      } else {
        setMicStatus("inactive");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setMicStatus((current) => current === "listening" ? "inactive" : current);
    };
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setMicStatus("denied");
    }
  };

  const cables = useMemo(() => SENSORS.map((sensor, index) => {
    const start = new THREE.Vector3(...sensor);
    const end = new THREE.Vector3(...BOARD_SOCKETS[index]);
    const curve = new THREE.CubicBezierCurve3(
      start,
      new THREE.Vector3(start.x, start.y + 3.4, start.z + 0.75),
      new THREE.Vector3(end.x, end.y - 1.9, end.z + 0.2),
      end,
    );
    return { curve, color: TELEMETRY[index].color };
  }), []);

  return (
    <group>
      <pointLight
        ref={opticalLightRef}
        position={[BOARD_CENTER[0], BOARD_CENTER[1], BOARD_CENTER[2] + 1.1]}
        color="#27f5ce"
        intensity={1.2}
        distance={26}
        decay={2}
      />
      {cables.map(({ curve, color }, index) => <group key={color}>
        <mesh>
          <tubeGeometry args={[curve, 36, 0.075, 8, false]} />
          <meshStandardMaterial
            ref={(material) => { cableMaterials.current[index * 2] = material; }}
            color={color}
            emissive={color}
            emissiveIntensity={0.75}
            transparent
            opacity={0.28}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <tubeGeometry args={[curve, 36, 0.026, 7, false]} />
          <meshStandardMaterial
            ref={(material) => { cableMaterials.current[index * 2 + 1] = material; }}
            color={color}
            emissive={color}
            emissiveIntensity={1.15}
            toneMapped={false}
          />
        </mesh>
        <mesh position={SENSORS[index]}>
          <sphereGeometry args={[0.19, 14, 14]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </group>)}
      <mesh position={BOARD_CENTER}>
        <boxGeometry args={[WIDTH, HEIGHT, 0.3]} />
        <meshPhysicalMaterial color="#0b1c21" roughness={0.24} metalness={0.45} transmission={0.12} transparent opacity={0.96} />
      </mesh>
      <mesh position={[BOARD_CENTER[0], BOARD_CENTER[1], BOARD_CENTER[2] + 0.17]}>
        <planeGeometry args={[WIDTH - 0.16, HEIGHT - 0.16]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
      {/* Shared live texture on the rear face, flipped so text reads normally from behind. */}
      <mesh position={[BOARD_CENTER[0], BOARD_CENTER[1], BOARD_CENTER[2] - 0.17]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[WIDTH - 0.16, HEIGHT - 0.16]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {FRAME_BARS.map(({ position, size }, index) => <mesh key={index} position={position}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          ref={(material) => { frameMaterials.current[index] = material; }}
          color="#073c38"
          emissive="#00ffd0"
          emissiveIntensity={1.0}
          toneMapped={false}
        />
      </mesh>)}
      {[0, Math.PI].map((rotationY) => <mesh
        key={rotationY}
        position={[MIC_WORLD_POSITION[0], MIC_WORLD_POSITION[1], BOARD_CENTER[2] + (rotationY ? -0.2 : 0.2)]}
        rotation={[0, rotationY, 0]}
        onClick={toggleMicrophone}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = ""; }}
      >
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>)}
    </group>
  );
}
