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
  react: "#0EA5E9",
  next: "#6366F1",
  ts: "#4F46E5",
  tw: "#0284C7",
  r3f: "#8B5CF6",
  node: "#16A34A",
  express: "#5B4BC4",
  rest: "#D97706",
  auth: "#8B5CF6",
  workers: "#EA580C",
  pg: "#2563EB",
  mysql: "#D97706",
  mongo: "#16A34A",
  redis: "#E11D48",
  docker: "#0284C7",
  cicd: "#CA8A04",
  owasp: "#EA580C",
  "api-sec": "#059669",
  helmet: "#4F46E5",
  encrypt: "#0EA5E9",
  audit: "#CA8A04",
};
const getSkillColor = (skill, themeMode) =>
  themeMode === "light" ? LIGHT_BRAND_COLORS[skill.id] || skill.color : skill.color;

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
const SKILL_THREE_COLORS = SKILLS.map((skill) => ({
  dark: new THREE.Color(skill.color),
  light: new THREE.Color(getSkillColor(skill, "light")),
}));
const DARK_SCENE_COLOR = new THREE.Color("#0B0F17");
const LIGHT_SCENE_COLOR = new THREE.Color("#EEF1FC");
const DARK_PRIMARY_LIGHT = new THREE.Color(theme.accent);
const LIGHT_PRIMARY_LIGHT = new THREE.Color("#2563A6");
const DARK_SECONDARY_LIGHT = new THREE.Color(theme.indigo);
const LIGHT_SECONDARY_LIGHT = new THREE.Color("#4F46A5");
const DARK_DUST_COLOR = new THREE.Color("#A9C8FF");
const LIGHT_DUST_COLOR = new THREE.Color("#66749A");
const DARK_EMISSIVE_COLOR = new THREE.Color("#1B2940");
const LIGHT_EMISSIVE_COLOR = new THREE.Color("#FFFFFF");
const DARK_BACKGROUND_ORB = new THREE.Color("#18202E");
const LIGHT_BACKGROUND_ORB = new THREE.Color("#E8ECF5");
const WHITE_ORB = new THREE.Color("#FFFFFF");
const ORBIT_COLORS = [
  [new THREE.Color(theme.accent), new THREE.Color("#3D5F8F")],
  [new THREE.Color(theme.indigo), new THREE.Color("#4F46A5")],
  [new THREE.Color(theme.secure), new THREE.Color("#2F7568")],
];

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
  const orbMaterial = useRef(null);
  const ambientLight = useRef(null);
  const firstLight = useRef(null);
  const secondLight = useRef(null);
  const dustMaterial = useRef(null);
  const fog = useRef(null);
  const orbitMaterials = useRef([]);
  const themeBlend = useRef(themeMode === "light" ? 1 : 0);
  const reveal = useRef(0);
  const sceneColor = useMemo(() => new THREE.Color(), []);
  const backgroundOrbColor = useMemo(() => new THREE.Color(), []);
  const orbColor = useMemo(() => new THREE.Color(), []);
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
    glows.forEach((sprite) => {
      sprite.material.blending = themeMode === "light"
        ? THREE.NormalBlending
        : THREE.AdditiveBlending;
      sprite.material.needsUpdate = true;
    });
  }, [glows, themeMode]);

  useFrame(({ pointer, clock }, delta) => {
    if (!meshRef.current || !groupRef.current) return;
    themeBlend.current = THREE.MathUtils.damp(
      themeBlend.current,
      themeMode === "light" ? 1 : 0,
      5,
      delta,
    );
    const themeAmount = themeBlend.current;
    const clearColor = sceneColor.copy(DARK_SCENE_COLOR).lerp(LIGHT_SCENE_COLOR, themeAmount);
    gl.setClearColor(clearColor, 0);
    if (fog.current) {
      fog.current.color.copy(clearColor);
      fog.current.near = THREE.MathUtils.lerp(10000, 5.4, themeAmount);
      fog.current.far = THREE.MathUtils.lerp(20000, 11, themeAmount);
    }
    if (ambientLight.current) {
      ambientLight.current.intensity = THREE.MathUtils.lerp(0.55, 1.3, themeAmount);
    }
    if (firstLight.current) {
      firstLight.current.intensity = THREE.MathUtils.lerp(1.3, 1.8, themeAmount);
      firstLight.current.color.copy(DARK_PRIMARY_LIGHT).lerp(LIGHT_PRIMARY_LIGHT, themeAmount);
    }
    if (secondLight.current) {
      secondLight.current.intensity = THREE.MathUtils.lerp(1.2, 1, themeAmount);
      secondLight.current.color.copy(DARK_SECONDARY_LIGHT).lerp(LIGHT_SECONDARY_LIGHT, themeAmount);
    }
    if (dustMaterial.current) {
      dustMaterial.current.color.copy(DARK_DUST_COLOR).lerp(LIGHT_DUST_COLOR, themeAmount);
      dustMaterial.current.opacity = THREE.MathUtils.lerp(0.5, 0.58, themeAmount);
    }
    if (orbMaterial.current) {
      orbMaterial.current.emissive.copy(DARK_EMISSIVE_COLOR).lerp(LIGHT_EMISSIVE_COLOR, themeAmount);
      orbMaterial.current.emissiveIntensity = THREE.MathUtils.lerp(0.4, 0.24, themeAmount);
      orbMaterial.current.roughness = THREE.MathUtils.lerp(0.24, 0.38, themeAmount);
      orbMaterial.current.metalness = THREE.MathUtils.lerp(0.48, 0.08, themeAmount);
      orbMaterial.current.clearcoat = themeAmount * 0.3;
    }
    orbitMaterials.current.forEach((material, index) => {
      if (!material) return;
      material.color.copy(ORBIT_COLORS[index][0]).lerp(ORBIT_COLORS[index][1], themeAmount);
      material.opacity = THREE.MathUtils.lerp(0.16, 0.28, themeAmount);
    });
    reveal.current = THREE.MathUtils.damp(reveal.current, 1, 2.2, delta);
    const selectedIndex = pinned ?? hovered;
    const time = clock.elapsedTime;

    SKILLS.forEach((skill, index) => {
      const position = ORB_POSITIONS[index];
      const selected = index === selectedIndex;
      const categoryMatch = category === "All" || skill.category === category;
      const depth = (position[2] + 2.65) / 5.3;
      const baseScale = 0.105 + depth * 0.045;
      const scale = baseScale * (1 + themeAmount * 0.3) * (selected ? 1.4 : 1);
      dummy.position.set(
        position[0] * reveal.current,
        position[1] * reveal.current,
        position[2] * reveal.current,
      );
      dummy.scale.setScalar(scale);
      dummy.rotation.set(time * 0.12, time * 0.2, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);
      const colorPair = SKILL_THREE_COLORS[index];
      const color = orbColor.copy(colorPair.dark).lerp(colorPair.light, themeAmount);
      if (!categoryMatch) {
        backgroundOrbColor.copy(DARK_BACKGROUND_ORB).lerp(LIGHT_BACKGROUND_ORB, themeAmount);
        color.lerp(backgroundOrbColor, 0.82);
      }
      if (selected) color.lerp(WHITE_ORB, THREE.MathUtils.lerp(0.25, 0.18, themeAmount));
      else if (selectedIndex != null) {
        color.lerp(LIGHT_BACKGROUND_ORB, 0.55 * themeAmount);
      }
      meshRef.current.setColorAt(index, color);
      glows[index].position.set(
        position[0] * reveal.current,
        position[1] * reveal.current,
        position[2] * reveal.current,
      );
      glows[index].material.color.copy(colorPair.dark).lerp(colorPair.light, themeAmount);
      const glowScale = selected ? 1.08 : categoryMatch ? 0.58 : 0.2;
      glows[index].scale.setScalar(THREE.MathUtils.lerp(glowScale, selected ? 0.72 : 0.42, themeAmount));
      const darkOpacity = selected ? 1 : categoryMatch ? 0.45 : 0.035;
      const lightOpacity = selected ? 0.3 : selectedIndex != null ? 0.025 : categoryMatch ? 0.22 : 0.015;
      glows[index].material.opacity = THREE.MathUtils.lerp(darkOpacity, lightOpacity, themeAmount);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
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
      <fog ref={fog} attach="fog" args={["#0B0F17", 10000, 20000]} />
      <ambientLight ref={ambientLight} intensity={0.55} />
      <pointLight ref={firstLight} position={[3, 2, 4]} color={theme.accent} intensity={1.3} distance={12} />
      <pointLight ref={secondLight} position={[-4, -1, -3]} color={theme.indigo} intensity={1.2} distance={12} />
      <Points positions={DUST_POSITIONS.slice(0, (mobile ? 100 : 180) * 3)} stride={3}>
        <PointMaterial
          ref={dustMaterial}
          transparent
          color="#A9C8FF"
          size={0.018}
          sizeAttenuation
          depthWrite={false}
          opacity={0.5}
        />
      </Points>
      <group ref={groupRef}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} rotation={[index * 0.82, index * 0.55, index * 0.38]}>
            <torusGeometry args={[1.05 + index * 0.18, 0.003, 4, 112]} />
            <meshBasicMaterial
              ref={(material) => { orbitMaterials.current[index] = material; }}
              color={[theme.accent, theme.indigo, theme.secure][index]}
              transparent
              opacity={0.16}
            />
          </mesh>
        ))}
        {glows.map((sprite, index) => (
          <primitive key={SKILLS[index].id} object={sprite} />
        ))}
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, SKILLS.length]}
        >
          {themeMode === "light"
            ? <sphereGeometry args={[1, 16, 12]} />
            : <icosahedronGeometry args={[1, 1]} />}
          <meshPhysicalMaterial
            ref={orbMaterial}
            vertexColors
            roughness={0.24}
            metalness={0.48}
            emissive="#1B2940"
            emissiveIntensity={0.4}
            clearcoat={0}
            clearcoatRoughness={0.2}
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
              style={{ "--skill-color": getSkillColor(skill, themeMode) }}
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
                  "--skill-color": getSkillColor(skill, themeMode),
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
