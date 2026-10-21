import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Points,
  PointMaterial,
  RoundedBox,
} from "@react-three/drei";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import * as THREE from "three";
import { theme, fonts, ease } from "../theme";
import { profile } from "../config/data";
import { useInViewCanvas, useIsDesktop } from "../hooks/useInViewCanvas";
import DownloadCvButton from "./DownloadCvButton";
import { useThemeMode } from "../hooks/useThemeMode";

function useViewport() {
  const get = () => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  };
  const [bp, setBp] = useState(get);
  useEffect(() => {
    let frame;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setBp(get()));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, []);
  return bp;
}

function useRoleCycle(roles, intervalMs = 3400) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % roles.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [roles, intervalMs]);
  return roles[index];
}

function HeroCopy({ breakpoint }) {
  const role = useRoleCycle(profile.roles);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const px = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), {
    stiffness: 50,
    damping: 18,
  });
  const py = useSpring(useTransform(mouseY, [0, 1], [-3, 3]), {
    stiffness: 50,
    damping: 18,
  });

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [mouseX, mouseY]);

  const scrollTo = (id) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(`#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toneColor = {
    accent: theme.accent,
    secure: theme.secure,
    indigo: theme.indigo,
  };

  return (
    <motion.div
      style={{
        x: breakpoint === "desktop" ? px : 0,
        y: breakpoint === "desktop" ? py : 0,
        position: "relative",
        zIndex: 20,
        maxWidth: breakpoint === "mobile" ? "100%" : 520,
        width: "100%",
        padding:
          breakpoint === "mobile"
            ? "1.5rem 1.25rem 1rem"
            : "0 clamp(1.5rem, 4vw, 4rem)",
        pointerEvents: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
        className="font-mono"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.7rem",
          color: theme.secure,
          background: theme.secureSoft,
          border: `1px solid rgba(52,211,153,0.25)`,
          padding: "0.35rem 0.75rem",
          borderRadius: 999,
          marginBottom: "1.35rem",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: theme.secure,
            boxShadow: `0 0 8px ${theme.secure}`,
          }}
        />
        Available for high-ticket projects
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.25, ease }}
        style={{
          fontFamily: fonts.sans,
          fontSize: "clamp(2.15rem, 5.2vw, 3.75rem)",
          fontWeight: 750,
          lineHeight: 1.08,
          letterSpacing: "-0.035em",
          color: theme.text,
          margin: "0 0 1rem",
        }}
      >
        Full-stack apps that{" "}
        <span
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.indigo})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          scale
        </span>{" "}
        and stay <span style={{ color: theme.secure }}>secure</span>
      </motion.h1>

      <div
        style={{
          height: "1.75rem",
          marginBottom: "1.15rem",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="font-mono"
            style={{
              margin: 0,
              fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
              color: theme.accent,
            }}
          >
            {role}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        style={{
          fontSize: "clamp(0.95rem, 1.6vw, 1.05rem)",
          lineHeight: 1.65,
          color: theme.textMuted,
          margin: "0 0 1.75rem",
          maxWidth: 440,
        }}
      >
        {profile.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.45 }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          onClick={() => scrollTo("projects")}
          style={{
            background: "transparent",
            border: `1px solid ${theme.borderStrong}`,
            color: theme.text,
            fontFamily: fonts.sans,
            fontWeight: 560,
            fontSize: "0.9rem",
            padding: "0.75rem 1.25rem",
            borderRadius: 10,
            cursor: "pointer",
            minWidth: breakpoint === "mobile" ? "100%" : "auto",
          }}
        >
          View Projects
        </button>
        <button
          type="button"
          onClick={() => scrollTo("contact")}
          style={{
            background: theme.secureSoft,
            border: `1px solid rgba(52,211,153,0.3)`,
            color: theme.secure,
            fontFamily: fonts.sans,
            fontWeight: 560,
            fontSize: "0.9rem",
            padding: "0.75rem 1.25rem",
            borderRadius: 10,
            cursor: "pointer",
            minWidth: breakpoint === "mobile" ? "100%" : "auto",
          }}
        >
          Audit Code
        </button>
        <DownloadCvButton showHint />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.25rem",
          fontFamily: fonts.mono,
          fontSize: "0.68rem",
          color: theme.textDim,
        }}
      >
        {profile.heroStats.map((item) => (
          <span
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: toneColor[item.tone] || theme.accent,
              }}
            />
            {item.label}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Premium geometric artifact ────────────────────────────────────────── */

const CODE_FACES = [
  {
    title: "REACT · UI",
    accent: "#38BDF8",
    code: [
      "export default function App() {",
      "  const [ready, setReady] = useState(false)",
      "  useEffect(() => boot(), [])",
      "  return <Dashboard ready={ready} />",
      "}",
      "✓ components compiled",
      "✓ hydration complete",
    ],
  },
  {
    title: "NEXT.JS · BUILD",
    accent: "#A5B4FC",
    code: [
      "▲ Next.js 15.2.4",
      "✓ Compiled successfully",
      "✓ Generating static pages",
      "✓ Collecting page data",
      "Route  /dashboard  24.8 kB",
      "Ready in 842ms",
    ],
  },
  {
    title: "NODE.JS · API",
    accent: "#34D399",
    code: [
      "const server = createServer(app)",
      "server.listen(3000, () => {",
      '  logger.info("API listening")',
      "})",
      "GET  /api/health   200  8ms",
      "POST /api/session  201  21ms",
      "● server running",
    ],
  },
  {
    title: "SECURITY · LAB",
    accent: "#FBBF24",
    code: [
      "$ nmap -sV localhost",
      "22/tcp  open  ssh",
      "80/tcp  open  http",
      "443/tcp open  https",
      "[!] Input validation gap",
      "[✓] Patched · tests passing",
      "Scan complete · localhost",
    ],
  },
];

function createCodeFace(face) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 320;
  const texture = new THREE.CanvasTexture(canvas);
  const context = canvas.getContext("2d");
  if (context) drawCodeFace(context, canvas, face, 0);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return { canvas, texture, face };
}

function drawCodeFace(context, canvas, face, frame, themeMode = "dark") {
  const light = themeMode === "light";
  context.fillStyle = light ? "#EDF3F8" : "#0B1220";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = light ? "#D9E5EF" : "#111C2E";
  context.fillRect(0, 0, canvas.width, 42);
  ["#FB7185", "#FBBF24", "#34D399"].forEach((color, index) => {
    context.beginPath();
    context.fillStyle = color;
    context.arc(18 + index * 18, 21, 5, 0, Math.PI * 2);
    context.fill();
  });
  context.font = "600 13px 'JetBrains Mono', monospace";
  context.fillStyle = face.accent;
  context.fillText(face.title, 78, 25);
  context.font = "13px 'JetBrains Mono', monospace";
  context.fillStyle = light ? "#24364A" : "#CBD5E1";

  const cycleLength = face.code.join("").length + face.code.length * 3;
  const typedCharacters = frame % cycleLength;
  let consumed = 0;
  face.code.forEach((line, index) => {
    const y = 77 + index * 29;
    const visibleLine = line.slice(0, Math.max(0, typedCharacters - consumed));
    context.fillText(visibleLine, 24, y);
    if (visibleLine.length < line.length && typedCharacters >= consumed) {
      context.fillStyle = face.accent;
      context.fillRect(26 + context.measureText(visibleLine).width, y - 13, 7, 15);
      context.fillStyle = light ? "#24364A" : "#CBD5E1";
    }
    consumed += line.length + 3;
  });
  context.fillStyle = light ? "#D9E5EF" : "#111C2E";
  context.fillRect(0, canvas.height - 30, canvas.width, 30);
  context.font = "11px 'JetBrains Mono', monospace";
  context.fillStyle = "#34D399";
  context.fillText("● LIVE", 16, canvas.height - 11);
  context.fillStyle = light ? "#52657B" : "#64748B";
  context.fillText("portfolio.dev", canvas.width - 115, canvas.height - 11);
}

function CodeBox({ mouseX, mouseY, draggingRef, themeMode }) {
  const group = useRef(null);
  const elapsed = useRef(0);
  const frameClock = useRef(0);
  const textureData = useMemo(() => CODE_FACES.map(createCodeFace), []);
  const materials = useMemo(
    () => {
      const faces = textureData.map(({ texture, face }) => {
        return new THREE.MeshPhysicalMaterial({
          map: texture,
          color: "#D6E6F3",
          metalness: 0.3,
          roughness: 0.44,
          emissive: face.accent,
          emissiveIntensity: 0.11,
          clearcoat: 0.8,
        });
      });
      const top = new THREE.MeshPhysicalMaterial({
      color: themeMode === "light" ? "#E8EFF6" : "#152238",
        metalness: 0.8,
        roughness: 0.22,
        emissive: themeMode === "light" ? "#D8E8F5" : "#101B32",
        emissiveIntensity: 0.5,
        clearcoat: 1,
      });
      const bottom = new THREE.MeshPhysicalMaterial({
        color: themeMode === "light" ? "#DCE8F2" : "#10192A",
        metalness: 0.8,
        roughness: 0.24,
        emissive: themeMode === "light" ? "#C8DDEC" : "#0B1728",
        emissiveIntensity: 0.35,
        clearcoat: 1,
      });
      return [faces[2], faces[3], top, bottom, faces[0], faces[1]];
    },
    [textureData, themeMode],
  );

  useEffect(
    () => () => {
      textureData.forEach(({ texture }) => texture.dispose());
      materials.forEach((material) => material.dispose());
    },
    [materials, textureData],
  );

  useFrame((_, delta) => {
    elapsed.current += delta;
    frameClock.current += delta;
    if (frameClock.current >= 1 / 18) {
      frameClock.current = 0;
      textureData.forEach(({ canvas, texture, face }, index) => {
        const context = canvas.getContext("2d");
        if (!context) return;
        drawCodeFace(context, canvas, face, Math.floor(elapsed.current * 18 + index * 17), themeMode);
        texture.needsUpdate = true;
      });
    }

    const box = group.current;
    if (!box || draggingRef.current) return;
    const intro = THREE.MathUtils.clamp(elapsed.current / 3, 0, 1);
    box.rotation.y += (0.14 + 5.5 * (1 - intro) ** 2) * delta;
    box.rotation.x = THREE.MathUtils.lerp(
      box.rotation.x,
      (mouseY.get() - 0.5) * -0.16 + 0.08 + Math.sin(elapsed.current) * 0.025,
      Math.min(1, delta * 2),
    );
    box.rotation.z = THREE.MathUtils.lerp(
      box.rotation.z,
      (mouseX.get() - 0.5) * 0.12,
      Math.min(1, delta * 2),
    );
    box.position.y = Math.sin(elapsed.current * 0.8) * 0.055;
  });

  return (
    <group ref={group}>
      <RoundedBox
        args={[2, 2, 2]}
        radius={0.075}
        smoothness={4}
        material={materials}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.025, 2.025, 2.025)]} />
        <lineBasicMaterial
          color={theme.accent}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

function Scene({ mouseX, mouseY, draggingRef, controlsRef, themeMode }) {
  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        minDistance={3.2}
        maxDistance={7.5}
        rotateSpeed={0.72}
        zoomSpeed={0.7}
        enableDamping
        dampingFactor={0.06}
        onStart={() => {
          draggingRef.current = true;
        }}
        onEnd={() => {
          draggingRef.current = false;
        }}
      />
      <ambientLight intensity={themeMode === "light" ? 0.82 : 0.48} />
      <directionalLight position={[4, 5, 4]} intensity={themeMode === "light" ? 1.4 : 1.15} color={themeMode === "light" ? "#FFFFFF" : "#E2E8F0"} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#6366F1" />
      <pointLight
        position={[2, 1, 3]}
        intensity={1.8}
        color={theme.accent}
        distance={8}
      />
      <pointLight
        position={[-2, -1, 2]}
        intensity={1.1}
        color={theme.secure}
        distance={7}
      />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.48} />
        <CodeBox mouseX={mouseX} mouseY={mouseY} draggingRef={draggingRef} themeMode={themeMode} />
        <ContactShadows
          position={[0, -1.45, 0]}
          opacity={0.48}
          scale={7}
          blur={2.8}
          far={3}
          color="#020617"
        />
      </Suspense>
      <ParticleField />
    </>
  );
}

const PARTICLE_POSITIONS = (() => {
  const points = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i += 1) {
    const angle = i * 2.39996;
    const radius = 2.5 + ((i * 17) % 80) / 100;
    points[i * 3] = Math.cos(angle) * radius;
    points[i * 3 + 1] = Math.sin(angle * 1.37) * 1.9;
    points[i * 3 + 2] = Math.sin(angle) * radius * 0.7;
  }
  return points;
})();

function ParticleField() {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.025;
    ref.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.035;
  });
  return (
    <Points
      ref={ref}
      positions={PARTICLE_POSITIONS}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color={theme.accent}
        size={0.022}
        sizeAttenuation
        depthWrite={false}
        opacity={0.45}
      />
    </Points>
  );
}

function HeroCanvas({ breakpoint, active }) {
  const controlsRef = useRef(null);
  const shellRef = useRef(null);
  const draggingRef = useRef(false);
  const pinchDistance = useRef(0);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const reducedMotion = useReducedMotion();
  const themeMode = useThemeMode();

  useEffect(() => {
    const canvas = shellRef.current?.querySelector("canvas");
    if (!canvas || !active) return undefined;

    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.deltaY === 0) return;
      const factor = Math.exp(Math.min(Math.abs(event.deltaY), 120) * 0.0012);
      if (event.deltaY < 0) controlsRef.current?.dollyOut(factor);
      else controlsRef.current?.dollyIn(factor);
      controlsRef.current?.update();
    };
    const distanceBetweenTouches = (touches) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
      );
    const onTouchStart = (event) => {
      if (event.touches.length === 2) {
        pinchDistance.current = distanceBetweenTouches(event.touches);
      }
    };
    const onTouchMove = (event) => {
      if (event.touches.length !== 2 || !pinchDistance.current) return;
      event.preventDefault();
      event.stopPropagation();
      const distance = distanceBetweenTouches(event.touches);
      const scale = distance / pinchDistance.current;
      if (scale > 1.01) controlsRef.current?.dollyOut(scale);
      if (scale < 0.99) controlsRef.current?.dollyIn(1 / scale);
      controlsRef.current?.update();
      pinchDistance.current = distance;
    };
    const onTouchEnd = (event) => {
      if (event.touches.length < 2) pinchDistance.current = 0;
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      pinchDistance.current = 0;
    };
  }, [active]);
  const onMove = useCallback(
    (e) => {
      const bounds = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - bounds.left) / bounds.width);
      mouseY.set((e.clientY - bounds.top) / bounds.height);
    },
    [mouseX, mouseY],
  );

  if (!active) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at center, ${theme.accentSoft}, transparent 70%)`,
        }}
      />
    );
  }

  return (
    <div
      ref={shellRef}
      className="hero-canvas-shell"
      tabIndex={0}
      role="group"
      aria-label="Interactive rotating code cube. Drag to orbit, use the wheel over the canvas to zoom, or pinch on touch screens."
      onPointerMove={onMove}
    >
      <Canvas
        frameloop={reducedMotion ? "demand" : "always"}
        dpr={breakpoint === "mobile" ? [1, 1.1] : [1, 1.4]}
        gl={{
          antialias: breakpoint !== "mobile",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{
          fov: breakpoint === "mobile" ? 48 : 42,
          near: 0.1,
          far: 40,
          position: [0, 0.15, breakpoint === "mobile" ? 5.2 : 4.8],
        }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <Scene
          mouseX={mouseX}
          mouseY={mouseY}
          draggingRef={draggingRef}
          controlsRef={controlsRef}
          themeMode={themeMode}
        />
      </Canvas>
      <div className="hero-zoom-controls" aria-label="Scene zoom controls">
        <button
          type="button"
          aria-label="Zoom in on code cube"
          onClick={() => {
            controlsRef.current?.dollyOut(1.2);
            controlsRef.current?.update();
          }}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out from code cube"
          onClick={() => {
            controlsRef.current?.dollyIn(1.2);
            controlsRef.current?.update();
          }}
        >
          −
        </button>
      </div>
    </div>
  );
}

export default function Hero() {
  const breakpoint = useViewport();
  const isDesktop = useIsDesktop(768);
  const { ref, inView } = useInViewCanvas({ rootMargin: "80px 0px" });

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        minHeight: "calc(100svh - 68px)",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: isDesktop
          ? "minmax(0, 1fr) minmax(0, 1fr)"
          : "1fr",
        alignItems: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)",
        }}
      />

      <HeroCopy breakpoint={breakpoint} />

      <div
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: "100%",
          height: isDesktop ? "100%" : "min(48vh, 380px)",
          minHeight: isDesktop ? 480 : 260,
          overflow: "hidden",
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(56,189,248,0.11), rgba(99,102,241,0.04) 38%, transparent 72%)",
        }}
      >
        <HeroCanvas breakpoint={breakpoint} active={inView} />
      </div>
    </section>
  );
}
