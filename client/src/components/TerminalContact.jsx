import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowUpRight,
  Code2,
  ContactRound,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { theme, ease, links } from "../theme";
import { contact as contactConfig } from "../config/data";
import { useInViewCanvas } from "../hooks/useInViewCanvas";
import { useThemeMode } from "../hooks/useThemeMode";

const FORM_ENDPOINT = contactConfig.formspreeEndpoint;
const CONTACT_METHODS = [
  {
    id: "email",
    label: "Email",
    value: links.email,
    href: `mailto:${links.email}`,
    icon: Mail,
    tone: theme.accent,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: links.whatsapp ? "Start a conversation" : "Number on request",
    href: links.whatsapp || null,
    icon: MessageCircle,
    tone: "#34D399",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: links.linkedin ? "Connect professionally" : "Profile not configured",
    href: links.linkedin || null,
    icon: ContactRound,
    tone: "#60A5FA",
  },
  {
    id: "github",
    label: "GitHub",
    value: "Explore my code",
    href: links.github,
    icon: Code2,
    tone: "#A5B4FC",
  },
];

function createGlobePoints(count) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const latitude = Math.acos(1 - (2 * (index + 0.5)) / count);
    const longitude = Math.PI * (1 + Math.sqrt(5)) * index;
    const radius = 1.38;
    positions[index * 3] = radius * Math.sin(latitude) * Math.cos(longitude);
    positions[index * 3 + 1] = radius * Math.cos(latitude);
    positions[index * 3 + 2] = radius * Math.sin(latitude) * Math.sin(longitude);
  }
  return positions;
}

const GLOBE_POINTS = createGlobePoints(620);

function GlobeScene({ themeMode }) {
  const { gl } = useThree();
  const globe = useRef(null);
  const arcs = useRef(null);
  const pin = useRef(null);
  const pinRing = useRef(null);
  const light = useRef(null);

  useEffect(() => {
    gl.setClearColor(themeMode === "light" ? "#EAF1F7" : "#0B0F17", 0);
  }, [gl, themeMode]);

  useFrame(({ clock }, delta) => {
    if (globe.current) globe.current.rotation.y += delta * 0.055;
    if (arcs.current) {
      arcs.current.rotation.y -= delta * 0.12;
      arcs.current.rotation.z += delta * 0.035;
    }
    if (pin.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3) * (themeMode === "light" ? 0.18 : 0.1);
      pin.current.scale.setScalar(pulse);
    }
    if (pinRing.current) {
      const phase = (clock.elapsedTime * 0.55) % 1;
      pinRing.current.scale.setScalar(0.75 + phase * 1.3);
      pinRing.current.material.opacity = (1 - phase) * (themeMode === "light" ? 0.72 : 0.42);
    }
    if (light.current) {
      light.current.intensity = 1.8 + Math.sin(clock.elapsedTime * 3) * 0.7;
    }
  });

  return (
    <>
      <ambientLight intensity={themeMode === "light" ? 0.85 : 0.42} />
      <pointLight position={[3, 2, 4]} intensity={themeMode === "light" ? 1.7 : 1.4} color={themeMode === "light" ? "#0369A1" : theme.accent} />
      <pointLight position={[-3, -2, -3]} intensity={themeMode === "light" ? 1.25 : 1} color={themeMode === "light" ? "#4F46E5" : theme.indigo} />

      <group ref={globe}>
        <Points positions={GLOBE_POINTS} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color={themeMode === "light" ? "#1F5F82" : "#8DDCFA"}
            size={themeMode === "light" ? 0.032 : 0.027}
            sizeAttenuation
            depthWrite={false}
            opacity={themeMode === "light" ? 1 : 0.88}
          />
        </Points>

        {[0, 1, 2].map((index) => (
          <mesh
            key={index}
            rotation={[
              0.35 + index * 0.78,
              index * 0.72,
              0.4 + index * 0.52,
            ]}
          >
            <torusGeometry
              args={[1.58 + index * 0.16, 0.009, 6, 96, Math.PI * 1.23]}
            />
            <meshBasicMaterial
              color={themeMode === "light" ? (index === 1 ? "#047857" : "#0369A1") : (index === 1 ? theme.secure : theme.accent)}
              transparent
              opacity={themeMode === "light" ? 0.68 - index * 0.08 : 0.34 - index * 0.06}
            />
          </mesh>
        ))}

        <group position={[0.68, 0.6, 1.02]}>
          {themeMode === "light" && (
            <mesh ref={pinRing} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.145, 32]} />
              <meshBasicMaterial
                color="#047857"
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
          <mesh ref={pin} position={[0, 0.21, 0]}>
            <sphereGeometry args={[0.095, 16, 12]} />
            <meshBasicMaterial color={themeMode === "light" ? "#047857" : "#F8FAFC"} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <coneGeometry args={[0.045, 0.23, 12]} />
            <meshBasicMaterial color={themeMode === "light" ? "#047857" : theme.secure} />
          </mesh>
          <pointLight
            ref={light}
            position={[0, 0.24, 0.12]}
            color={themeMode === "light" ? "#047857" : theme.secure}
            distance={1.1}
            intensity={2}
          />
        </group>
      </group>

      <group ref={arcs}>
        <mesh rotation={[0.2, 0.4, 0.5]}>
          <torusGeometry args={[1.92, 0.008, 5, 80, Math.PI * 1.2]} />
          <meshBasicMaterial color={themeMode === "light" ? "#4F46E5" : theme.indigo} transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[1.1, -0.5, 1.2]}>
          <torusGeometry args={[2.06, 0.008, 5, 80, Math.PI * 1.05]} />
          <meshBasicMaterial color={themeMode === "light" ? "#0369A1" : theme.accent} transparent opacity={0.5} />
        </mesh>
      </group>
    </>
  );
}

function GlobePanel({ status }) {
  const { ref, inView } = useInViewCanvas({ rootMargin: "120px 0px" });
  const reducedMotion = useReducedMotion();
  const themeMode = useThemeMode();

  return (
    <div
      ref={ref}
      className="contact-globe-panel"
      role="img"
      aria-label="Dotted globe with animated connection arcs and a marker over Lahore, Pakistan"
    >
      {inView && (
        <Canvas
          aria-hidden="true"
          frameloop={reducedMotion ? "demand" : "always"}
          dpr={[1, 1.2]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "low-power",
          }}
          camera={{ fov: 42, position: [0, 0, 5.2], near: 0.1, far: 30 }}
          style={{ width: "100%", height: "100%" }}
        >
          <GlobeScene themeMode={themeMode} />
        </Canvas>
      )}
      <div className="contact-globe-label">
        <MapPin size={15} aria-hidden="true" />
        Lahore, Pakistan
      </div>
      <div className="contact-globe-caption font-mono">
        <span className="contact-live-dot" />
        OPEN TO GLOBAL COLLABORATION
      </div>
      <div className="contact-globe-orbit-label font-mono">31.5204° N</div>
      {(status === "success" || status === "error") && (
        <div
          key={status}
          className={`contact-feedback contact-feedback-${status}`}
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {status === "success" ? (
            <>
              <div className="feedback-plane" aria-hidden="true">
                <svg viewBox="0 0 64 48" focusable="false">
                  <path className="feedback-trail" d="M3 38 C19 29 29 37 42 21" />
                  <path className="feedback-plane-shape" d="M18 23 59 5 43 43 34 29 18 23Z M34 29 59 5" />
                </svg>
              </div>
              <span className="feedback-check" aria-hidden="true">✓</span>
              <strong>Message sent!</strong>
              <span>I&apos;ll get back to you soon.</span>
              <div className="feedback-confetti" aria-hidden="true">
                {Array.from({ length: 14 }, (_, index) => (
                  <i
                    key={index}
                    style={{
                      "--particle-index": index,
                      "--particle-x": `${(index - 7) * 12}px`,
                      "--particle-y": `${-45 - (index % 4) * 8}px`,
                      "--particle-angle": `${index * 29}deg`,
                      "--particle-end-angle": `${index * 65}deg`,
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="feedback-error-icon" aria-hidden="true">!</span>
              <strong>That didn&apos;t go through.</strong>
              <span>Please try again, or reach me at {links.email}.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MagneticContact({ item, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 16 });
  const springY = useSpring(y, { stiffness: 180, damping: 16 });
  const Icon = item.icon;

  const move = (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.06);
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.06);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <>
      <span className="contact-method-icon" style={{ color: item.tone }}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="contact-method-copy">
        <span className="contact-method-label font-mono">{item.label}</span>
        <span className="contact-method-value">{item.value}</span>
      </span>
      <ArrowUpRight
        className="contact-method-arrow"
        size={16}
        aria-hidden="true"
      />
    </>
  );

  const sharedProps = {
    className: `contact-method glass${item.href ? "" : " contact-method-disabled"}`,
    onPointerMove: move,
    onPointerLeave: reset,
    style: { x: springX, y: springY, "--contact-tone": item.tone },
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-30px" },
    transition: { duration: 0.45, delay: index * 0.06, ease },
    whileHover: item.href ? { scale: 1.015 } : undefined,
  };

  return item.href ? (
    <motion.a
      {...sharedProps}
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={`${item.label}: ${item.value}`}
    >
      {content}
    </motion.a>
  ) : (
    <motion.div
      {...sharedProps}
      aria-label={`${item.label}: contact details available on request`}
    >
      {content}
    </motion.div>
  );
}

function ContactForm({
  values,
  setValues,
  errors,
  status,
  onSend,
}) {
  const fieldProps = (id, error) => ({
    id,
    className: "contact-input",
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    disabled: status === "sending",
  });
  const change = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    <form
      className="contact-form glass"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      noValidate
    >
      <div className="contact-form-heading">
        <div>
          <span className="font-mono contact-form-kicker">PROJECT INQUIRY</span>
          <h3>Tell me what you’re building</h3>
        </div>
        <Send size={19} aria-hidden="true" />
      </div>

      <div className="contact-form-grid">
        <div className="contact-field">
          <label htmlFor="contact-name">Name</label>
          <input
            {...fieldProps("contact-name", errors.name)}
            autoComplete="name"
            value={values.name}
            onChange={change("name")}
            placeholder="Your name"
          />
          {errors.name && <span id="contact-name-error" className="contact-error">{errors.name}</span>}
        </div>
        <div className="contact-field">
          <label htmlFor="contact-email">Email</label>
          <input
            {...fieldProps("contact-email", errors.email)}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={change("email")}
            placeholder="you@company.com"
          />
          {errors.email && <span id="contact-email-error" className="contact-error">{errors.email}</span>}
        </div>
        <div className="contact-field">
          <label htmlFor="contact-project-type">Project type</label>
          <select
            {...fieldProps("contact-project-type")}
            value={values.projectType}
            onChange={change("projectType")}
          >
            {contactConfig.projectTypes.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="contact-field">
          <label htmlFor="contact-budget">Budget (optional)</label>
          <select
            {...fieldProps("contact-budget")}
            value={values.budget}
            onChange={change("budget")}
          >
            <option value="">Select a range</option>
            {contactConfig.budgets.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="contact-field contact-field-wide">
          <label htmlFor="contact-message">Project details</label>
          <textarea
            {...fieldProps("contact-message", errors.message)}
            rows={4}
            value={values.message}
            onChange={change("message")}
            placeholder="Goals, timeline, and any stack preferences…"
          />
          {errors.message && <span id="contact-message-error" className="contact-error">{errors.message}</span>}
        </div>
      </div>

      {status === "error" && (
        <p className="contact-error contact-submit-error" role="alert">
          Could not send your message. Please try again or email {links.email}.
        </p>
      )}

      <button className="contact-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

const TERMINAL_PROMPTS = [
  "What should I call you?",
  "Where can I reach you?",
  "What are you looking to build?",
];
const TERMINAL_FIELDS = ["name", "email", "message"];

function TerminalForm({ values, setValues, errors, status, onSend }) {
  const [step, setStep] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const inputRef = useRef(null);
  const activeField = TERMINAL_FIELDS[step];

  useEffect(() => {
    if (step >= TERMINAL_PROMPTS.length) return undefined;
    const prompt = TERMINAL_PROMPTS[step];
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedPrompt(prompt.slice(0, index));
      if (index >= prompt.length) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step < TERMINAL_FIELDS.length) inputRef.current?.focus();
  }, [step]);

  const validateStep = () => {
    const value = values[activeField].trim();
    let error = "";
    if (activeField === "name" && value.length < 2) error = "Please enter at least 2 characters.";
    if (activeField === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Enter a valid email address.";
    }
    if (activeField === "message" && value.length < 10) {
      error = "Add at least 10 characters so I have some context.";
    }
    return error;
  };

  const proceed = (event) => {
    event?.preventDefault();
    if (status === "sending") return;
    if (step < TERMINAL_FIELDS.length) {
      const error = validateStep();
      if (error) {
        setValues((current) => ({ ...current, terminalError: error }));
        return;
      }
      setValues((current) => ({ ...current, terminalError: "" }));
      setStep((current) => current + 1);
      return;
    }
    onSend();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && (activeField !== "message" || !event.shiftKey)) {
      event.preventDefault();
      proceed();
    }
  };

  const update = (event) =>
    setValues((current) => ({
      ...current,
      [activeField]: event.target.value,
      terminalError: "",
    }));

  return (
    <form className="terminal-contact glass" onSubmit={proceed}>
      <div className="terminal-window-heading">
        <span className="terminal-lights" aria-hidden="true"><i /><i /><i /></span>
        <span className="font-mono">ahmad@portfolio: ~/contact</span>
      </div>
      <div className="terminal-transcript font-mono" aria-live="polite">
        <p><span>$</span> contact --secure</p>
        {step > 0 && <p><span>name</span> {values.name}</p>}
        {step > 1 && <p><span>email</span> {values.email}</p>}
        {step > 2 && <p className="terminal-transcript-message"><span>message</span> {values.message}</p>}
        {step < TERMINAL_FIELDS.length ? (
          <label className="terminal-prompt" htmlFor="terminal-current-input">
            <span className="terminal-prompt-question">{typedPrompt}</span>
            {activeField === "message" ? (
              <textarea
                ref={inputRef}
                id="terminal-current-input"
                className="terminal-input"
                value={values.message}
                onChange={update}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={status === "sending"}
                aria-label={TERMINAL_PROMPTS[step]}
                autoComplete="off"
              />
            ) : (
              <input
                ref={inputRef}
                id="terminal-current-input"
                className="terminal-input"
                type={activeField === "email" ? "email" : "text"}
                value={values[activeField]}
                onChange={update}
                onKeyDown={handleKeyDown}
                disabled={status === "sending"}
                aria-label={TERMINAL_PROMPTS[step]}
                autoComplete={activeField === "name" ? "name" : "email"}
              />
            )}
          </label>
        ) : (
          <div className="terminal-confirm font-mono">
            <p>Ready to send this message?</p>
            <button type="button" onClick={() => setStep(2)} disabled={status === "sending"}>
              Edit message
            </button>
          </div>
        )}
        {(values.terminalError || errors.name || errors.email || errors.message) && (
          <p className="terminal-error" role="alert">
            {values.terminalError || errors.name || errors.email || errors.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="contact-submit terminal-submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : step < TERMINAL_FIELDS.length ? "Enter ↵" : "Confirm & send"}
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

export default function TerminalContact() {
  const headingRef = useRef(null);
  const inView = useInView(headingRef, { once: true, margin: "-40px" });
  const [mode, setMode] = useState("form");
  const [status, setStatus] = useState("idle");
  const [terminalResetKey, setTerminalResetKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    projectType: contactConfig.projectTypes[0],
    budget: "",
    message: "",
    terminalError: "",
  });

  useEffect(() => {
    if (status !== "success") return undefined;
    const timer = window.setTimeout(() => {
      setValues({
        name: "",
        email: "",
        projectType: contactConfig.projectTypes[0],
        budget: "",
        message: "",
        terminalError: "",
      });
      setErrors({});
      setTerminalResetKey((key) => key + 1);
      setStatus("idle");
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [status]);

  const sendMessage = async () => {
    const nextErrors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (values.message.trim().length < 10) {
      nextErrors.message = "Please add at least 10 characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("sending");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          project_type: values.projectType,
          budget: values.budget || "Not specified",
          message: values.message.trim(),
          _subject: `Portfolio inquiry — ${values.projectType}`,
        }),
      });
      if (!response.ok) throw new Error("The contact form request failed.");
      setStatus("success");
    } catch (error) {
      console.error("Unable to send the contact form.", error);
      setStatus("error");
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-aurora" aria-hidden="true" />
      <div ref={headingRef} className="contact-heading">
        <motion.p
          className="font-mono contact-kicker"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease }}
        >
          #contact · Lahore to everywhere
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.06, ease }}
        >
          Let’s make your next idea real.
        </motion.h2>
        <p>
          Tell me about your product, timeline, and goals. I’ll help you find a
          clear path from idea to launch.
        </p>
      </div>

      <div className="contact-mode-toggle" role="group" aria-label="Contact mode">
        <motion.span
          className="contact-mode-pill"
          animate={{ x: mode === "form" ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          aria-hidden="true"
        />
        {["form", "terminal"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            disabled={status === "sending"}
          >
            {option === "form" ? "Form" : "Terminal"}
          </button>
        ))}
      </div>

      <div className="contact-layout">
        <div className="contact-main-column">
          {mode === "form" ? (
            <ContactForm
              values={values}
              setValues={setValues}
              errors={errors}
              status={status}
              onSend={sendMessage}
            />
          ) : (
            <TerminalForm
              key={terminalResetKey}
              values={values}
              setValues={setValues}
              errors={errors}
              status={status}
              onSend={sendMessage}
            />
          )}
          <div className="contact-method-grid">
            {CONTACT_METHODS.map((item, index) => (
              <MagneticContact key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
        <GlobePanel status={status} />
      </div>
    </section>
  );
}
