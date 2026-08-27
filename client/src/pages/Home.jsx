import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(document.body.classList.contains('light-theme'));
  const particleCanvasRef = useRef(null);
  const cityCanvasRef = useRef(null);

  // Stats Counters
  const [ridesSeeded, setRidesSeeded] = useState(0);
  const [driversOnline, setDriversOnline] = useState(0);
  const [efficiencyRate, setEfficiencyRate] = useState(0);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      setIsLight(true);
    } else {
      document.body.classList.remove('light-theme');
      setIsLight(false);
    }

    // Stats counter animation
    const rideInterval = setInterval(() => {
      setRidesSeeded(prev => (prev < 14208 ? prev + 197 : 14208));
    }, 15);
    const driverInterval = setInterval(() => {
      setDriversOnline(prev => (prev < 984 ? prev + 13 : 984));
    }, 20);
    const efficiencyInterval = setInterval(() => {
      setEfficiencyRate(prev => (prev < 99.4 ? Math.round((prev + 1.2) * 10) / 10 : 99.4));
    }, 30);

    return () => {
      clearInterval(rideInterval);
      clearInterval(driverInterval);
      clearInterval(efficiencyInterval);
    };
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      setIsLight(false);
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      setIsLight(true);
      localStorage.setItem('theme', 'light');
    }
  };

  // 1. Mouse-Reactive Particle Backdrop Canvas
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 65;
    const connectionDistance = 110;
    const mouse = { x: null, y: null, radius: 150 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse attraction physics
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(211, 84, 0, 0.4)' : 'rgba(241, 196, 15, 0.6)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseout', onMouseLeave);
    window.addEventListener('resize', onResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isLight 
              ? `rgba(211, 84, 0, ${0.15 - dist / connectionDistance})` 
              : `rgba(241, 196, 15, ${0.25 - dist / connectionDistance})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseout', onMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [isLight]);

  // 2. 3D Revolving Isometric Wireframe City Map Canvas
  useEffect(() => {
    const canvas = cityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = 450);
    const height = (canvas.height = 350);

    let angle = 0;

    // Define building nodes in 3D Space (X, Y, Z, height)
    const buildings = [
      { x: -80, z: -80, w: 30, d: 30, h: 70 },
      { x: 40, z: -60, w: 25, d: 25, h: 90 },
      { x: -50, z: 50, w: 35, d: 35, h: 50 },
      { x: 60, z: 40, w: 20, d: 20, h: 110 },
      { x: 0, z: 0, w: 20, d: 20, h: 130 }
    ];

    // Vehicles moving along isometric grid lines
    const vehicles = [
      { start: { x: -120, z: -20 }, end: { x: 120, z: -20 }, progress: 0, speed: 0.005, color: '#f1c40f' },
      { start: { x: 30, z: -120 }, end: { x: 30, z: 120 }, progress: 0.4, speed: 0.008, color: '#3498db' },
      { start: { x: -80, z: 80 }, end: { x: 100, z: 80 }, progress: 0.1, speed: 0.006, color: '#2ecc71' }
    ];

    const project = (x, y, z) => {
      // Apply 3D Y-rotation
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const rotX = x * cosA - z * sinA;
      const rotZ = x * sinA + z * cosA;

      // Perspective projection
      const dist = 300;
      const scale = dist / (dist + rotZ);
      const projX = width / 2 + rotX * scale * 1.5;
      const projY = height / 2 + (y + 40) * scale * 1.2; // isometric tilt offset

      return { x: projX, y: projY, scale };
    };

    const drawLine3D = (p1, p2, color, widthVal = 1) => {
      const pt1 = project(p1.x, p1.y, p1.z);
      const pt2 = project(p2.x, p2.y, p2.z);

      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = widthVal;
      ctx.stroke();
    };

    const drawBuilding3D = (b) => {
      const color = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)';
      const edgeColor = isLight ? 'rgba(211,84,0,0.3)' : 'rgba(241,196,15,0.3)';

      // 8 vertices of cuboid
      const v = [
        { x: b.x, y: 0, z: b.z },
        { x: b.x + b.w, y: 0, z: b.z },
        { x: b.x + b.w, y: 0, z: b.z + b.d },
        { x: b.x, y: 0, z: b.z + b.d },
        { x: b.x, y: -b.h, z: b.z },
        { x: b.x + b.w, y: -b.h, z: b.z },
        { x: b.x + b.w, y: -b.h, z: b.z + b.d },
        { x: b.x, y: -b.h, z: b.z + b.d }
      ];

      // Draw wireframe edges
      drawLine3D(v[0], v[1], color);
      drawLine3D(v[1], v[2], color);
      drawLine3D(v[2], v[3], color);
      drawLine3D(v[3], v[0], color);

      drawLine3D(v[4], v[5], edgeColor, 1.5);
      drawLine3D(v[5], v[6], edgeColor, 1.5);
      drawLine3D(v[6], v[7], edgeColor, 1.5);
      drawLine3D(v[7], v[4], edgeColor, 1.5);

      drawLine3D(v[0], v[4], color);
      drawLine3D(v[1], v[5], color);
      drawLine3D(v[2], v[6], color);
      drawLine3D(v[3], v[7], color);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Rotate city very slowly
      angle += 0.0025;

      // Draw grid floor lines
      const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.02)';
      for (let i = -140; i <= 140; i += 40) {
        drawLine3D({ x: i, y: 0, z: -140 }, { x: i, y: 0, z: 140 }, gridColor);
        drawLine3D({ x: -140, y: 0, z: i }, { x: 140, y: 0, z: i }, gridColor);
      }

      // Draw buildings
      buildings.forEach(drawBuilding3D);

      // Draw moving vehicles
      vehicles.forEach(veh => {
        veh.progress += veh.speed;
        if (veh.progress > 1) veh.progress = 0;

        const posX = veh.start.x + (veh.end.x - veh.start.x) * veh.progress;
        const posZ = veh.start.z + (veh.end.z - veh.start.z) * veh.progress;

        const p = project(posX, -2, posZ);

        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = veh.color;
        ctx.shadowColor = veh.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between position-relative" style={{ backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* Background Interactive Neuronal Particle Network */}
      <canvas 
        ref={particleCanvasRef} 
        className="position-absolute top-0 start-0 w-100 h-100" 
        style={{ pointerEvents: 'auto', zIndex: 1 }}
      />

      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent px-4 py-3 position-relative animate-fade-in-up" style={{ zIndex: 10 }}>
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <i className="bi bi-taxi-front-fill text-warning fs-2 animate-pulse-radar"></i>
            <span className="fw-bold fs-3 text-white tracking-wide">Ride<span className="text-warning">Ready</span></span>
          </Link>
          
          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '34px', height: '34px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}
              title="Toggle Light/Dark Theme"
            >
              <i className={`bi ${isLight ? 'bi-moon-stars-fill text-info' : 'bi-sun-fill text-warning'}`}></i>
            </button>
            <Link to="/login" className="btn btn-premium-outline btn-sm">Sign In</Link>
            <Link to="/alogin" className="btn btn-outline-info btn-sm">Admin Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Futuristic Hero Viewport */}
      <div className="container my-auto py-5 position-relative" style={{ zIndex: 10 }}>
        <div className="row align-items-center justify-content-between g-5">
          <div className="col-lg-6 text-center text-lg-start animate-fade-in-up">
            <span className="badge bg-warning text-dark px-3 py-2 mb-3 fw-bold text-uppercase tracking-wider">MERN Autonomous Dispatch</span>
            
            <h1 className="display-3 fw-bold text-white mb-4 leading-sm" style={{ color: 'var(--text-primary)' }}>
              Next Generation<br />
              <span className="gradient-text">Cab Dispatches</span>
            </h1>
            
            <p className="lead text-secondary mb-5 fs-5" style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
              RideReady blends HTML5 WebGL animations, real-time dispatches, voice booking, and cashless checkout into an ultra-premium MERN booking experience.
            </p>
            
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <Link to="/register" className="btn btn-premium btn-lg px-4 py-3">
                <i className="bi bi-rocket-takeoff-fill me-2"></i> Launch Application
              </Link>
              <Link to="/login" className="btn btn-premium-outline btn-lg px-4 py-3">
                <i className="bi bi-compass-fill me-2"></i> Explore Portals
              </Link>
            </div>
          </div>

          <div className="col-lg-5 text-center position-relative">
            {/* revolving 3D Wireframe city grid */}
            <div className="glass-panel p-4 mb-4" style={{ overflow: 'hidden' }}>
              <span className="text-secondary small fw-bold mb-2 d-block text-start"><i className="bi bi-globe me-1 text-warning"></i> 3D WEBGL CITY GRID SIMULATION</span>
              <canvas ref={cityCanvasRef} className="w-100 h-100" style={{ maxHeight: '250px' }} />
            </div>

            {/* Premium quick options panel */}
            <div className="glass-panel p-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h5 className="fw-bold text-white text-start mb-3" style={{ color: 'var(--text-primary)' }}>Sign In to Portal</h5>
              <div className="row g-2">
                <div className="col-4">
                  <Link to="/register?role=rider" className="btn btn-premium-outline w-100 btn-sm text-truncate"><i className="bi bi-person-circle"></i> Rider</Link>
                </div>
                <div className="col-4">
                  <Link to="/register?role=driver" className="btn btn-premium-outline w-100 btn-sm text-truncate"><i className="bi bi-steering"></i> Driver</Link>
                </div>
                <div className="col-4">
                  <Link to="/alogin" className="btn btn-premium w-100 btn-sm text-truncate text-white"><i className="bi bi-shield-lock"></i> Admin</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time telemetry dashboard section */}
      <div className="container py-5 border-top border-secondary border-opacity-25 position-relative animate-fade-in-up" style={{ zIndex: 10, animationDelay: '0.4s' }}>
        <div className="row g-4 justify-content-center text-center">
          <div className="col-md-4">
            <div className="glass-card p-4">
              <span className="text-secondary small d-block mb-1" style={{ color: 'var(--text-secondary)' }}>PLATFORM REQUESTS</span>
              <h2 className="fw-bold text-warning mb-1">{ridesSeeded.toLocaleString()}</h2>
              <span className="text-success small"><i className="bi bi-arrow-up-right"></i> Live mock dispatches</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4">
              <span className="text-secondary small d-block mb-1" style={{ color: 'var(--text-secondary)' }}>ONLINE DRIVERS</span>
              <h2 className="fw-bold text-info mb-1">{driversOnline}</h2>
              <span className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>Active GPS vehicles</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4">
              <span className="text-secondary small d-block mb-1" style={{ color: 'var(--text-secondary)' }}>AI ROUTE OPTIMIZATION</span>
              <h2 className="fw-bold text-success mb-1">{efficiencyRate}%</h2>
              <span className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>Dispatch efficiency index</span>
            </div>
          </div>
        </div>
      </div>

      {/* Story citation & footer */}
      <footer className="bg-dark bg-opacity-50 py-4 border-top border-secondary border-opacity-25 position-relative animate-fade-in-up" style={{ zIndex: 10 }}>
        <div className="container text-center">
          <p className="text-secondary small mb-3" style={{ color: 'var(--text-secondary)' }}>
            <em>"When Sarah needed to reach the airport urgently, she booked a Tesla cab via RideReady and arrived on time!"</em>
          </p>
          <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} RideReady Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
