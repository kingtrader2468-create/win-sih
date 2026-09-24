import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer
} from 'three';
import './PixelSnow.css';

function PixelSnow({
  color = '#ffffff',
  minFlakeSize = 1.25,
  speed = 0.6,
  density = 0.3,
  direction = 125,
  brightness = 1,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new Scene();
    const camera = new PerspectiveCamera(55, 1, 1, 1000);
    camera.position.z = 280;
    const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const count = Math.round(520 * Math.min(1, Math.max(0.05, density)));
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const spread = 260;
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      positions[offset] = (Math.random() - 0.5) * spread;
      positions[offset + 1] = (Math.random() - 0.5) * spread;
      positions[offset + 2] = (Math.random() - 0.5) * 260;
      velocities[index] = 0.12 + Math.random() * 0.55;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    const material = new PointsMaterial({
      color: new Color(color),
      size: Math.max(minFlakeSize, 1.25) * brightness,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: AdditiveBlending
    });
    const flakes = new Points(geometry, material);
    scene.add(flakes);

    let frameId = 0;
    let lastTime = performance.now();
    const windRadians = (direction * Math.PI) / 180;
    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const animate = (time) => {
      const delta = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;
      const points = geometry.attributes.position.array;
      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        points[offset + 1] -= velocities[index] * speed * delta;
        points[offset] += Math.cos(windRadians) * 0.12 * speed * delta;
        points[offset + 2] += Math.sin(windRadians) * 0.08 * speed * delta;
        if (points[offset + 1] < -spread / 2) points[offset + 1] = spread / 2;
        if (points[offset] > spread / 2) points[offset] = -spread / 2;
        if (points[offset] < -spread / 2) points[offset] = spread / 2;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [color, minFlakeSize, speed, density, direction, brightness]);

  return <div ref={containerRef} className={`pixel-snow-container ${className}`.trim()} style={style} aria-hidden="true" />;
}

export default PixelSnow;
