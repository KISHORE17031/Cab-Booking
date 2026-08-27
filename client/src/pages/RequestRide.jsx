import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Rnav from '../components/Rnav';

const RequestRide = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [date, setDate] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI suggestions & selected route states
  const [activeRouteMode, setActiveRouteMode] = useState('express'); // eco, express, short
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(0);

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [voiceLog, setVoiceLog] = useState('');

  // Surge Pricing Visualizer Canvas Ref
  const surgeCanvasRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAvailableCars(token);
  }, [navigate]);

  useEffect(() => {
    if (pickup && drop) {
      // Dynamic route distance simulation depending on selected AI mode
      let baseDist = Math.max(4, Math.round((pickup.length + drop.length) * 0.5));
      if (activeRouteMode === 'eco') {
        setEstimatedDistance(Math.round(baseDist * 0.8 * 10) / 10);
      } else if (activeRouteMode === 'express') {
        setEstimatedDistance(Math.round(baseDist * 1.2 * 10) / 10);
      } else {
        setEstimatedDistance(baseDist);
      }
    } else {
      setEstimatedDistance(0);
    }
  }, [pickup, drop, activeRouteMode]);

  useEffect(() => {
    if (selectedCar && estimatedDistance > 0) {
      setEstimatedFare(Math.round(estimatedDistance * selectedCar.pricePerKm));
    } else {
      setEstimatedFare(0);
    }
  }, [estimatedDistance, selectedCar]);

  // Surge Pricing Visualizer Animation Loop
  useEffect(() => {
    const canvas = surgeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = 300);
    const height = (canvas.height = 100);

    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw pricing baseline grid
      ctx.strokeStyle = 'var(--glass-border)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Supply Wave
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.03 + offset) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Demand Wave (Surge multiplier)
      ctx.strokeStyle = 'var(--accent-color)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.02 - offset * 1.5) * 25 + Math.cos(x * 0.01) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += 0.05;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Web Speech API Assistant
  const startVoiceBooking = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech recognition is not supported in this browser. Please try Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setVoiceLog('Say something like: "Book ride from Airport to Central Station"');

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript.toLowerCase();
      setVoiceLog(`Captured: "${speechToText}"`);
      parseVoiceBookingCommand(speechToText);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
      setVoiceLog('Speech capture error. Click mic to retry.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const parseVoiceBookingCommand = (text) => {
    // Regex parsing: "from [pickup] to [dropoff]"
    const match = text.match(/from\s+(.+)\s+to\s+(.+)/i);
    if (match && match.length >= 3) {
      setPickup(match[1].trim());
      setDrop(match[2].trim());
      setVoiceLog(`🤖 AI Parsed - Pickup: "${match[1]}", Drop-off: "${match[2]}"`);
    } else {
      // Default fallback
      setPickup(text);
      setVoiceLog('Could not parse "from ... to ..." structure. Try stating: "from [Location A] to [Location B]"');
    }
  };

  const fetchAvailableCars = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/cars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const available = response.data.cars.filter(car => car.status === 'available');
        setCars(available);
      } else {
        setError('Failed to fetch vehicles list');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRide = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !selectedCar) return;

    setError('');
    setRequestLoading(true);

    try {
      const response = await axios.post(
        'https://cab-booking-g8dt.onrender.com/api/rides/request',
        {
          carId: selectedCar._id,
          pickupLocation: `${pickup} (${activeRouteMode.toUpperCase()} Route)`,
          dropLocation: drop,
          bookingDate: date || new Date().toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        navigate(`/ridetracking/${response.data.ride._id}`);
      } else {
        setError(response.data.message || 'Ride request failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while requesting ride');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Rnav />

      <div className="container py-5 animate-fade-in-up">
        <div className="mb-4">
          <Link to="/rhome" className="text-warning text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        <div className="row g-5">
          {/* Booking Inputs */}
          <div className="col-lg-6">
            <div className="glass-panel p-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-white mb-0">
                  <i className="bi bi-geo-alt-fill text-warning me-2 animate-pulse-radar"></i>
                  Request Ride
                </h3>
                
                {/* Voice Booking Trigger */}
                <button
                  type="button"
                  onClick={startVoiceBooking}
                  className={`btn rounded-circle d-flex align-items-center justify-content-center ${
                    isListening ? 'btn-danger animate-pulse-radar' : 'btn-outline-warning'
                  }`}
                  style={{ width: '45px', height: '45px' }}
                  title="Speak booking details"
                >
                  <i className={`bi ${isListening ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                </button>
              </div>

              {/* Voice Status Console */}
              {(isListening || voiceLog) && (
                <div className="glass-card p-3 mb-4 border-warning border-opacity-15 bg-warning bg-opacity-5">
                  <span className="text-warning small fw-bold d-block"><i className="bi bi-cpu me-1 animate-pulse-radar"></i>AI SPEECH COPILOT</span>
                  <p className="text-white small mb-0 mt-1">{voiceLog}</p>
                  
                  {isListening && (
                    <div className="d-flex align-items-center gap-1 mt-2">
                      <span className="spinner-grow spinner-grow-sm text-danger" style={{ width: '8px', height: '8px' }}></span>
                      <span className="text-secondary small">Listening... speak clearly</span>
                    </div>
                  )}
                </div>
              )}
              
              <form onSubmit={handleRequestRide}>
                <div className="mb-3">
                  <label className="text-secondary small mb-1 fw-semibold">PICKUP LOCATION</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-circle-fill text-warning small"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter pickup address"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-secondary small mb-1 fw-semibold">DROP-OFF LOCATION</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-geo-alt-fill text-warning"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter drop-off address"
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-secondary small mb-1 fw-semibold">PICKUP DATE & TIME</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-calendar-event"></i></span>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* AI Route Suggestions Widget */}
                {pickup && drop && (
                  <div className="glass-card p-4 mb-4 border-warning border-opacity-10 bg-opacity-25" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <i className="bi bi-cpu text-warning animate-pulse-radar"></i>
                      <span className="text-white small fw-bold tracking-wider">AI OPTIMIZED ROUTE OPTIONS</span>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveRouteMode('express')}
                        className={`btn btn-sm text-start py-2 px-3 border rounded d-flex justify-content-between align-items-center ${
                          activeRouteMode === 'express' ? 'btn-premium text-white border-transparent' : 'btn-outline-secondary text-white'
                        }`}
                      >
                        <span><i className="bi bi-lightning-fill me-1"></i> Expressway Route</span>
                        <span className="badge bg-dark bg-opacity-50 text-warning">{estimatedDistance} km &bull; ~12 min</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveRouteMode('short')}
                        className={`btn btn-sm text-start py-2 px-3 border rounded d-flex justify-content-between align-items-center ${
                          activeRouteMode === 'short' ? 'btn-premium text-white border-transparent' : 'btn-outline-secondary text-white'
                        }`}
                      >
                        <span><i className="bi bi-signpost-fill me-1"></i> Shortest Bypass</span>
                        <span className="badge bg-dark bg-opacity-50 text-warning">{estimatedDistance} km &bull; ~15 min</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveRouteMode('eco')}
                        className={`btn btn-sm text-start py-2 px-3 border rounded d-flex justify-content-between align-items-center ${
                          activeRouteMode === 'eco' ? 'btn-premium text-white border-transparent' : 'btn-outline-secondary text-white'
                        }`}
                      >
                        <span><i className="bi bi-flower1 me-1"></i> Eco-Green Path</span>
                        <span className="badge bg-dark bg-opacity-50 text-warning">{estimatedDistance} km &bull; ~18 min</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedCar && estimatedFare > 0 && (
                  <div className="glass-card p-3 mb-4 d-flex justify-content-between align-items-center border-warning border-opacity-20 bg-warning bg-opacity-5">
                    <div>
                      <span className="text-secondary small d-block">ESTIMATED FARE</span>
                      <span className="text-muted small">AI Calculated Distance: {estimatedDistance} km</span>
                    </div>
                    <h3 className="fw-bold text-warning mb-0">&#8377;{estimatedFare}</h3>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                  disabled={requestLoading || !selectedCar}
                >
                  {requestLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Requesting Ride...
                    </>
                  ) : (
                    <>
                      Confirm Dispatch <i className="bi bi-send-fill"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Map & Cars list */}
          <div className="col-lg-6">
            {/* High-tech SVG Map Panel */}
            <div className="glass-panel p-4 mb-4" style={{ height: '300px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary small fw-bold"><i className="bi bi-map me-1 text-warning"></i> LIVE DIGITAL ROUTE</span>
                {pickup && drop && (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-30 animate-pulse-radar">
                    AI Active Pathing
                  </span>
                )}
              </div>

              <div className="w-100 h-100 position-relative" style={{ height: '220px' }}>
                <svg className="w-100 h-100" viewBox="0 0 400 220" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                  <defs>
                    <pattern id="gridMap" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--glass-border)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#gridMap)" />
                  
                  {pickup && drop ? (
                    <>
                      {/* Curved Route Line */}
                      <path 
                        d="M 80 160 Q 200 40 320 100" 
                        fill="none" 
                        stroke="var(--accent-color)" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        className="route-path-line"
                      />
                      <path 
                        d="M 80 160 Q 200 40 320 100" 
                        fill="none" 
                        stroke="var(--bg-primary)" 
                        strokeWidth="1" 
                        strokeDasharray="4, 4"
                      />

                      {/* Pickup node */}
                      <circle cx="80" cy="160" r="14" fill="var(--accent-glow)" />
                      <circle cx="80" cy="160" r="8" fill="#3498db" className="animate-pulse-radar" />
                      <text x="60" y="195" fill="var(--text-primary)" fontSize="10" fontWeight="bold">Pickup</text>

                      {/* Drop node */}
                      <circle cx="320" cy="100" r="14" fill="var(--accent-glow)" />
                      <circle cx="320" cy="100" r="8" fill="var(--accent-color)" className="animate-pulse-radar" />
                      <text x="300" y="130" fill="var(--text-primary)" fontSize="10" fontWeight="bold">Drop-off</text>

                      {/* Isometric 3D Car Vector riding on the path */}
                      <g className="route-car-icon" style={{ transformOrigin: 'center' }}>
                        <path d="M -12 -5 L 12 -5 L 15 2 L -15 2 Z" fill="#e67e22" />
                        <path d="M -8 -9 L 8 -9 L 10 -5 L -10 -5 Z" fill="#34495e" />
                        <circle cx="-6" cy="4" r="3" fill="#2c3e50" />
                        <circle cx="6" cy="4" r="3" fill="#2c3e50" />
                      </g>
                    </>
                  ) : (
                    <g transform="translate(140, 90)" className="text-center">
                      <circle cx="60" cy="20" r="25" fill="var(--accent-glow)" />
                      <path d="M 52 10 L 68 10 L 72 25 L 48 25 Z" fill="var(--accent-color)" className="animate-float-car" />
                      <text x="60" y="70" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">Enter route addresses or speak</text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Dynamic Surge Pricing Visualizer */}
            <div className="glass-panel p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small fw-bold"><i className="bi bi-graph-up me-1 text-success"></i> REAL-TIME TRAFFIC & SURGE ANALYSIS</span>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-30">
                  {activeRouteMode === 'eco' ? '1.0x Surge' : activeRouteMode === 'express' ? '1.3x Surge' : '1.15x Surge'}
                </span>
              </div>
              <canvas ref={surgeCanvasRef} className="w-100" style={{ height: '50px' }} />
            </div>

            <h4 className="fw-bold text-white mb-4">Select Cab Category</h4>
            
            {loading ? (
              <div className="d-grid gap-3">
                <div className="skeleton-bar p-3" style={{ height: '80px', borderRadius: '12px' }}>
                  <div className="skeleton-bar w-50 h-25 mb-2"></div>
                  <div className="skeleton-bar w-75 h-25"></div>
                </div>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-5 glass-panel text-secondary">
                <i className="bi bi-wifi-off fs-1 text-muted d-block mb-3"></i>
                <p>No available drivers or vehicles found at this moment.</p>
                <p className="small text-muted">Try registering a driver or adding a cab to the fleet catalog first!</p>
              </div>
            ) : (
              <div className="row g-3">
                {cars.map((car) => (
                  <div key={car._id} className="col-12">
                    <div
                      onClick={() => setSelectedCar(car)}
                      className={`glass-card p-3 d-flex align-items-center justify-content-between cursor-pointer border-2 ${
                        selectedCar?._id === car._id ? 'border-warning bg-warning bg-opacity-5' : 'border-transparent'
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-dark rounded p-2 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '60px' }}>
                          {car.image ? (
                            <img
                              src={`https://cab-booking-g8dt.onrender.com/uploads/${car.image}`}
                              alt={car.name}
                              className="w-100 h-100 object-fit-cover rounded"
                            />
                          ) : (
                            <i className="bi bi-taxi-front text-warning fs-3 animate-float-car"></i>
                          )}
                        </div>
                        <div>
                          <h6 className="fw-bold text-white mb-0">{car.name}</h6>
                          <span className="badge bg-secondary small">{car.model}</span>
                          <span className="text-secondary small ms-2"><i className="bi bi-people-fill text-warning"></i> {car.seats} seats</span>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="text-secondary small d-block">RATE</span>
                        <span className="fw-bold text-warning">&#8377;{car.pricePerKm}/km</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRide;
