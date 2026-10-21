import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Points, PointMaterial } from "@react-three/drei";
import { motion, useInView, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { theme, fonts, ease } from "../theme";
import { skillPillars } from "../config/data";
import { useInViewCanvas, useIsDesktop } from "../hooks/useInViewCanvas";
import { useThemeMode } from "../hooks/useThemeMode";

const CATEGORIES = ["All", "Frontend", "Backend", "Database", "Security", "DevOps"];
const BRAND_COLORS = {
  react: "#61DAFB",
  next: "#E2E8F0",
  ts: "#3178C6",
  tw: "#38BDF8",
  r3f: "#A78BFA",
  node: "#83CD29",
  express: "#D1D5DB",
  rest: "#F59E0B",
  auth: "#A78BFA",
  workers: "#FB923C",
  pg: "#699ECA",
  mysql: "#F29111",
  mongo: "#47A248",
  redis: "#DC382D",
  docker: "#2496ED",
  cicd: "#F59E0B",
  owasp: "#F97316",
  "api-sec": "#34D399",
  helmet: "#A5B4FC",
  encrypt: "#38BDF8",
  audit: "#FBBF24",
};
const LIGHT_BRAND_COLORS = {
  react: "#087EA4",
  next: "#334155",
  ts: "#1453A6",
  tw: "#0369A1",
  r3f: "#6D28D9",
  node: "#3F7D20",
  express: "#475569",
  rest: "#B45309",
  auth: "#6D28D9",
  workers: "#C2410C",
  pg: "#285A88",
  mysql: "#A94F00",
  mongo: "#26752A",
  redis: "#B42318",
  docker: "#1263A3",
  cicd: "#A16207",
  owasp: "#C2410C",
  "api-sec": "#047857",
  helmet: "#4338CA",
  encrypt: "#0369A1",
  audit: "#A16207",
};

const SKILLS = skillPillars.flatMap((pillar) =>
  pillar.skills.map((skill) => {
    const isDevOps = ["docker", "cicd"].includes(skill.id);
    const category = isDevOps
      ? "DevOps"
      : pillar.id === "security"
        ? "Security"
        : pillar.id === "cloud"
          ? "Database"
          : pillar.title.startsWith("Frontend")
            ? "Frontend"
            : "Backend";
    return {
      ...skill,
      category,
      color: BRAND_COLORS[skill.id] || pillar.color,
    };
  }),
);

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const ORB_POSITIONS = SKILLS.map((_, index) => {
  const y = 1 - (index / (SKILLS.length - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const angle = GOLDEN_ANGLE * index;
  return [
    Math.cos(angle) * radius * 2.65,
    y * 2.65,
    Math.sin(angle) * radius * 2.65,
  ];
});

const DUST_POSITIONS = new Float32Array(180 * 3);
for (let i = 0; i < 180; i += 1) {
  const angle = i * 2.39996;
  const radius = 3.2 + ((i * 17) % 100) / 100 * 1.6;
  DUST_POSITIONS[i * 3] = Math.cos(angle) * radius;
  DUST_POSITIONS[i * 3 + 1] = Math.sin(angle * 0.73) * radius * 0.58;
  DUST_POSITIONS[i * 3 + 2] = Math.sin(angle) * radius;
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.12, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.42, "rgba(255,255,255,0.14)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Galaxy({ category, hovered, pinned, onHover, onPin, reducedMotion, mobile, themeMode }) {
  const { gl } = useThree();
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const outlineRef = useRef(null);
  const reveal = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const glows = useMemo(
    () =>
      SKILLS.map((skill) => {
        const material = new THREE.SpriteMaterial({
          map: glowTexture,
          color: skill.color,
          transparent: true,
          opacity: 0.48,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(...ORB_POSITIONS[SKILLS.indexOf(skill)]);
        sprite.scale.setScalar(0.58);
        return sprite;
      }),
    [glowTexture],
  );

  useEffect(
    () => () => {
      glows.forEach((sprite) => sprite.material.dispose());
      glowTexture.dispose();
    },
    [glows, glowTexture],
  );

  useEffect(() => {
    gl.setClearColor(themeMode === "light" ? "#EAF1F7" : "#0B0F17", 0);
  }, [gl, themeMode]);

  useEffect(() => {
    glows.forEach((sprite) => {
      sprite.material.blending = themeMode === "light"
        ? THREE.NormalBlending
        : THREE.AdditiveBlending;
      sprite.material.needsUpdate = true;
    });
  }, [glows, themeMode]);

  useFrame(({ pointer, clock }, delta) => {
    if (!meshRef.current || !groupRef.current) return;
    reveal.current = THREE.MathUtils.damp(reveal.current, 1, 2.2, delta);
    const selectedIndex = pinned ?? hovered;
    const time = clock.elapsedTime;

    SKILLS.forEach((skill, index) => {
      const position = ORB_POSITIONS[index];
      const selected = index === selectedIndex;
      const categoryMatch = category === "All" || skill.category === category;
      const depth = (position[2] + 2.65) / 5.3;
      const baseScale = 0.105 + depth * 0.045;
      const scale = baseScale * (themeMode === "light" ? 1.3 : 1) * (selected ? 1.4 : 1);
      dummy.position.set(
        position[0] * reveal.current,
        position[1] * reveal.current,
        position[2] * reveal.current,
      );
      dummy.scale.setScalar(scale);
      dummy.rotation.set(time * 0.12, time * 0.2, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
      dummy.scale.setScalar(themeMode === "light" ? baseScale * 1.56 : 0);
      dummy.updateMatrix();
      outlineRef.current?.setMatrixAt(index, dummy.matrix);

      const displayColor = themeMode === "light"
        ? LIGHT_BRAND_COLORS[skill.id] || skill.color
        : skill.color;
      const baseColor = new THREE.Color(displayColor);
      const color = categoryMatch
        ? baseColor
        : baseColor.clone().lerp(new THREE.Color(themeMode === "light" ? "#E5EAF0" : "#18202E"), 0.82);
      if (selected) color.lerp(new THREE.Color(themeMode === "light" ? "#FFFFFF" : "#FFFFFF"), 0.25);
      else if (themeMode === "light" && selectedIndex != null) {
        color.lerp(new THREE.Color("#E5EAF0"), 0.68);
      }
      meshRef.current.setColorAt(index, color);
      glows[index].position.set(
        position[0] * reveal.current,
        position[1] * reveal.current,
        position[2] * reveal.current,
      );
      glows[index].material.color.set(displayColor);
      glows[index].scale.setScalar(selected ? 1.08 : categoryMatch ? 0.58 : 0.2);
      glows[index].material.opacity = selected
        ? 1
        : themeMode === "light" && selectedIndex != null
          ? 0.12
          : categoryMatch
            ? (themeMode === "light" ? 0.62 : 0.45)
            : 0.035;
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (outlineRef.current) outlineRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    if (!reducedMotion) {
      const speed = hovered == null && pinned == null ? 0.045 : 0.009;
      groupRef.current.rotation.y += delta * speed;
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        pointer.y * 0.12,
        2,
        delta,
      );
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        pointer.x * -0.09,
        2,
        delta,
      );
    }
  });

  const activeIndex = pinned ?? hovered;
  const activeSkill = activeIndex == null ? null : SKILLS[activeIndex];

  return (
    <>
      <ambientLight intensity={themeMode === "light" ? 0.9 : 0.55} />
      <pointLight position={[3, 2, 4]} color={themeMode === "light" ? "#38BDF8" : theme.accent} intensity={1.3} distance={12} />
      <pointLight position={[-4, -1, -3]} color={theme.indigo} intensity={1.2} distance={12} />
      <Points positions={DUST_POSITIONS.slice(0, (mobile ? 100 : 180) * 3)} stride={3}>
        <PointMaterial
          transparent
          color={themeMode === "light" ? "#55748D" : "#A9C8FF"}
          size={themeMode === "light" ? 0.022 : 0.018}
          sizeAttenuation
          depthWrite={false}
          opacity={themeMode === "light" ? 0.72 : 0.5}
        />
      </Points>
      <group ref={groupRef}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} rotation={[index * 0.82, index * 0.55, index * 0.38]}>
            <torusGeometry args={[1.05 + index * 0.18, 0.003, 4, 112]} />
            <meshBasicMaterial
              color={themeMode === "light"
                ? ["#35617A", "#5853A8", "#267A68"][index]
                : [theme.accent, theme.indigo, theme.secure][index]}
              transparent
              opacity={themeMode === "light" ? 0.34 : 0.16}
            />
          </mesh>
        ))}
        <instancedMesh
          ref={outlineRef}
          args={[undefined, undefined, SKILLS.length]}
          visible={themeMode === "light"}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#294A62" />
        </instancedMesh>
        {glows.map((sprite, index) => (
          <primitive key={SKILLS[index].id} object={sprite} />
        ))}
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, SKILLS.length]}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            vertexColors
            roughness={0.24}
            metalness={0.48}
            emissive={themeMode === "light" ? "#D7E6F3" : "#1B2940"}
            emissiveIntensity={themeMode === "light" ? 0.65 : 0.4}
          />
        </instancedMesh>
        {SKILLS.map((skill, index) => (
          <Html
            key={`hit-${skill.id}`}
            position={ORB_POSITIONS[index]}
            center
            style={{ pointerEvents: "auto" }}
          >
            <button
              type="button"
              className="skill-orb-hit-area"
              aria-label={`Highlight ${skill.label}, ${skill.category}`}
              aria-pressed={pinned === index}
              title={`${skill.label} · ${skill.category}`}
              onPointerMove={() => onHover(index)}
              onPointerEnter={() => onHover(index)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(index)}
              onBlur={() => onHover(null)}
              onClick={(event) => {
                event.stopPropagation();
                onPin(index);
              }}
              style={{ "--skill-color": skill.color }}
            />
          </Html>
        ))}
        {SKILLS.map((skill, index) => {
          const position = ORB_POSITIONS[index];
          const depth = (position[2] + 2.65) / 5.3;
          return (
            <Html
              key={`label-${skill.id}`}
              position={[position[0], position[1] - 0.2, position[2]]}
              center
              style={{ pointerEvents: "none" }}
            >
              <span
                className={`skill-orb-label${index === activeIndex ? " is-active" : ""}`}
                style={{
                  "--skill-color": skill.color,
                  opacity: Math.max(0.3, 0.32 + depth * 0.68) * (activeIndex != null && index !== activeIndex ? 0.42 : 1),
                }}
              >
                {skill.label}
              </span>
            </Html>
          );
        })}
        {activeSkill && (
          <Html
            position={ORB_POSITIONS[activeIndex]}
            center
            distanceFactor={8}
            style={{ pointerEvents: "none" }}
          >
            <div className="skill-galaxy-tooltip" role="status">
              <strong>{activeSkill.label}</strong>
              <span>{activeSkill.category}</span>
            </div>
          </Html>
        )}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={!reducedMotion && pinned == null}
        autoRotateSpeed={hovered == null ? 0.13 : 0.035}
        rotateSpeed={0.55}
      />
    </>
  );
}

function SectionIntro() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{ marginBottom: "1.5rem", maxWidth: 650 }}>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="font-mono"
        style={{
          fontSize: "0.7rem",
          color: theme.accent,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
        }}
      >
        #skills · interactive galaxy
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.08, ease }}
        style={{
          fontFamily: fonts.sans,
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          margin: "0 0 0.75rem",
          color: theme.text,
        }}
      >
        A universe of things I build with
      </motion.h2>
      <p style={{ margin: 0, color: theme.textMuted, fontSize: "1rem", lineHeight: 1.65 }}>
        Drag to orbit. Hover or tap an orb to explore a skill, or filter the galaxy by domain.
      </p>
    </div>
  );
}

export default function Arsenal() {
  const isDesktop = useIsDesktop(768);
  const reducedMotion = useReducedMotion();
  const themeMode = useThemeMode();
  const { ref, inView } = useInViewCanvas({ rootMargin: "120px 0px" });
  const [category, setCategory] = useState("All");
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const selected = pinned ?? hovered;

  const chooseCategory = (value) => {
    setCategory(value);
    setPinned(null);
    setHovered(null);
  };

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        minHeight: "100vh",
        padding: "clamp(4rem, 8vh, 6rem) clamp(1.25rem, 5vw, 4rem)",
      }}
    >
      <SectionIntro />
      <div className="skill-galaxy-filters" role="group" aria-label="Filter skills by category">
        {CATEGORIES.map((value) => (
          <button
            key={value}
            type="button"
            className={`skill-filter${category === value ? " is-active" : ""}`}
            aria-pressed={category === value}
            onClick={() => chooseCategory(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <motion.div
        ref={ref}
        className="skill-galaxy-shell"
        initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: reducedMotion ? 0 : 0.7, ease }}
      >
        {inView ? (
          <Canvas
            frameloop={reducedMotion ? "demand" : "always"}
            dpr={isDesktop ? [1, 1.35] : [1, 1.1]}
            gl={{ antialias: isDesktop, alpha: true, powerPreference: "high-performance" }}
            camera={{ fov: 43, position: [0, 0, 8.2], near: 0.1, far: 30 }}
            onPointerMissed={() => setPinned(null)}
            style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
            aria-label="Interactive three-dimensional skills galaxy"
          >
            <Galaxy
              category={category}
              hovered={hovered}
              pinned={pinned}
              onHover={setHovered}
              onPin={(index) => setPinned((current) => (current === index ? null : index))}
              reducedMotion={reducedMotion}
              mobile={!isDesktop}
              themeMode={themeMode}
            />
          </Canvas>
        ) : (
          <div className="skill-galaxy-loading" aria-hidden="true" />
        )}
        <span className="skill-galaxy-hint font-mono" aria-hidden="true">
          DRAG TO ORBIT <span>·</span> TAP TO PIN
        </span>
      </motion.div>
      <div className="skill-orb-list" role="group" aria-label="Choose a skill to highlight">
        {SKILLS.filter((skill) => category === "All" || skill.category === category).map((skill) => {
          const index = SKILLS.indexOf(skill);
          return (
            <button
              key={skill.id}
              type="button"
              className={selected === index ? "is-active" : ""}
              onClick={() => setPinned((current) => (current === index ? null : index))}
              aria-pressed={pinned === index}
              style={{ "--skill-color": skill.color }}
            >
              <span aria-hidden="true" />
              {skill.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
