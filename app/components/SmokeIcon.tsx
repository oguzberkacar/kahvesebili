import React, { useEffect, useState } from "react";
import SmokeLeftIcon from "./SmokeLeftIcon";
import SmokeMiddleIcon from "./SmokeMiddleIcon";
import SmokeRightIcon from "./SmokeRightIcon";

type Props = {
  className?: string; // Positioning class
  fill?: string;
};

type Particle = {
  id: number;
  x: number; // 0-100% position
  IconComp: React.FC<any>;
  duration: number; // 3-5s
  delay: number; // 0s initiate
};

export default function SmokeIcon({ className, fill = "white" }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate constant stream of particles
    const icons = [SmokeLeftIcon, SmokeMiddleIcon, SmokeRightIcon];

    const addParticle = (initialDelay = 0) => {
      const id = Math.random();
      const Icon = icons[Math.floor(Math.random() * icons.length)];
      const x = Math.random() * 80 + 10; // 10% to 90%
      const duration = 1.5 + Math.random() * 1.5; // 1.5-3s

      setParticles((prev) => {
        // Cleanup old particles (naive: keep last 10?)
        // Better: Remove by ID after timeout. But for simple React state,
        // we can just keep adding and slice, or let animation handle visual exit.
        // Let's keep array small.
        const neo = [...prev, { id, x, IconComp: Icon, duration, delay: initialDelay }];
        if (neo.length > 10) return neo.slice(neo.length - 10);
        return neo;
      });
    };

    addParticle(-1); // Fast-forward first particle to be immediately visible
    const interval = setInterval(() => addParticle(0), 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className} style={{ position: "relative" }}>
      <style>
        {`
          @keyframes riseRandom {
            0% { transform: translateY(120%) scale(0.6); opacity: 0; }
            20% { opacity: 0.7; }
            100% { transform: translateY(-20%) scale(1.1); opacity: 0; }
          }
        `}
      </style>

      {particles.map((p) => {
        const { IconComp, id, x, duration, delay } = p;
        return (
          <div
            key={id}
            className="absolute bottom-0"
            style={{
              left: `${x}%`,
              width: "30px",
              height: "35px",
              animation: `riseRandom ${duration}s linear forwards`,
              animationDelay: `${delay}s`,
            }}
          >
            <IconComp className="w-full h-full" fill={fill} />
          </div>
        );
      })}
    </div>
  );
}
