import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Rnav from '../components/Rnav';

const RideTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Toast Alert System State
  const [toasts, setToasts] = useState([]);
  const lastStatusRef = useRef('');

  // Live Telemetry States (Flashing dials)
  const [speed, setSpeed] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(720); // 12 mins in seconds

  // AI Copilot Chat Drawer States
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'AI Copilot', text: 'Hello! I am your RideReady Copilot. How can I assist you with your trip today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Payment Form States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Rating States
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchRideDetails(token);

    // Setup real-time polling every 3 seconds
    const interval = setInterval(() => {
      fetchRideDetails(token);
    }, 3000);

    return () => clearInterval(interval);
  }, [id, navigate]);

  // Telemetry fluctuation simulator (Speedometer, ETA)
  useEffect(() => {
    if (!ride) return;

    let telemetryInterval;
    if (ride.status === 'started') {
      telemetryInterval = setInterval(() => {
        // Fluctuating speed between 55 and 68 km/h
        setSpeed(Math.floor(Math.random() * (68 - 55 + 1) + 55));
        setEtaSeconds(prev => (prev > 10 ? prev - 3 : 10));
      }, 1000);
    } else {
      setSpeed(0);
    }

    return () => clearInterval(telemetryInterval);
  }, [ride]);

  const addToast = (message) => {
    const newToast = { id: Date.now(), message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const fetchRideDetails = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/rider/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const found = response.data.rides.find(r => r._id === id);
        if (found) {
          setRide(found);
          if (found.paymentStatus === 'paid') {
            setPaymentSuccess(true);
          }

          // Trigger toast notifications on status changes
          if (lastStatusRef.current && lastStatusRef.current !== found.status) {
            if (found.status === 'accepted') {
              addToast(`Driver ${found.driverId?.name || 'Assigned'} has accepted your dispatch request!`);
            } else if (found.status === 'started') {
              addToast('Trip started. Wish you a comfortable journey!');
            } else if (found.status === 'completed') {
              addToast('You have arrived at your destination. Complete payment.');
            }
          }
          lastStatusRef.current = found.status;
        } else {
          setError('Ride not found');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error pulling status logs');
    } finally {
      setLoading(false);
    }
  };

  // AI Chat responses
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'You', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Trigger AI response simulation
    setTimeout(() => {
      let aiResponse = "I am checking that telemetry detail for you.";
      const query = chatInput.toLowerCase();

      if (query.includes('speed') || query.includes('fast')) {
        aiResponse = `Our telemetry indicates the driver is currently traveling at ${speed} km/h on your chosen optimized route.`;
      } else if (query.includes('fare') || query.includes('cost') || query.includes('price')) {
        aiResponse = `The total fare calculated for this route is \u20B9${ride?.fare || 0}. No surge pricing was applied.`;
      } else if (query.includes('eta') || query.includes('time') || query.includes('arrive')) {
        aiResponse = `Estimated arrival time is approximately ${Math.round(etaSeconds / 60)} minutes based on active traffic grid densities.`;
      } else if (query.includes('driver') || query.includes('name')) {
        aiResponse = ride?.driverId 
          ? `Your assigned driver is ${ride.driverId.name}. Contact phone is ${ride.driverId.phone}.` 
          : "We are still allocating the nearest driver to accept your dispatch request.";
      } else {
        aiResponse = "Command processed. AI dispatch systems indicate optimal progression towards destination hubs.";
      }

      setMessages(prev => [...prev, { sender: 'AI Copilot', text: aiResponse }]);
    }, 1000);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !ride) return;

    setPaymentLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://cab-booking-g8dt.onrender.com/api/rides/pay',
        { rideId: ride._id, amount: ride.fare, paymentMethod: 'Cashless Card' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPaymentSuccess(true);
        addToast('Payment processed successfully!');
      } else {
        setError('Payment processing failed');
      }
    } catch (err) {
      console.error(err);
      setError('Checkout error occurred');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRating = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !ride) return;

    setRatingLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://cab-booking-g8dt.onrender.com/api/rides/rate',
        {
          rideId: ride._id,
          driverId: ride.driverId?._id || ride.driverId,
          stars,
          comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRatingSuccess(true);
        addToast('Thank you for your rating!');
        setTimeout(() => {
          navigate('/rhome');
        }, 1500);
      } else {
        setError('Rating submission failed');
      }
    } catch (err) {
      console.error(err);
      setError('Error submitting rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const getStepStatusClass = (step) => {
    if (!ride) return 'step-pending';
    const states = ['pending', 'accepted', 'started', 'completed'];
    const currentIndex = states.indexOf(ride.status);
    const stepIndex = states.indexOf(step);

    if (currentIndex > stepIndex) return 'step-completed text-success';
    if (currentIndex === stepIndex) return 'step-active text-warning fw-bold';
    return 'step-inactive text-muted';
  };

  const getMapTrackingState = () => {
    if (!ride) return { x: 80, y: 160, label: 'Searching...' };
    switch (ride.status) {
      case 'pending':
        return { x: 80, y: 160, label: 'Awaiting Driver...' };
      case 'accepted':
        return { x: 50, y: 70, label: 'Driver Arriving...' };
      case 'started':
        return { x: 200, y: 100, label: 'In Transit...' };
      case 'completed':
        return { x: 320, y: 100, label: 'Arrived!' };
      default:
        return { x: 80, y: 160, label: 'Searching...' };
    }
  };

  const mapPos = getMapTrackingState();

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Rnav />

      {/* Floating Toast Notification Container */}
      <div className="toast-container-holder">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-message-item animate-fade-in-up">
            <i className="bi bi-bell-fill text-warning animate-pulse-radar"></i>
            <span className="small fw-semibold">{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="container py-5 animate-fade-in-up">
        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : !ride ? (
          <div className="text-center py-5 text-secondary">
            <p>Ride details not available.</p>
          </div>
        ) : (
          <div className="row g-5">
            {/* Live Map Tracking Panel */}
            <div className="col-lg-7">
              <div className="glass-panel p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold text-white mb-0">Driver Location Tracking</h4>
                  <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-30">
                    Live GPS Simulated
                  </span>
                </div>

                {/* SVG Live tracking map */}
                <div className="w-100 position-relative mb-4" style={{ height: '300px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 400 240" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                    <defs>
                      <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--glass-border)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#gridPattern)" />

                    {/* Route line */}
                    <path 
                      d="M 80 160 Q 200 40 320 100" 
                      fill="none" 
                      stroke="var(--glass-border)" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                    />
                    {ride.status === 'started' && (
                      <path 
                        d="M 80 160 Q 200 40 320 100" 
                        fill="none" 
                        stroke="var(--accent-color)" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        className="route-path-line"
                      />
                    )}

                    {/* Pickup Node */}
                    <circle cx="80" cy="160" r="10" fill="rgba(52, 152, 219, 0.2)" />
                    <circle cx="80" cy="160" r="5" fill="#3498db" />
                    <text x="60" y="185" fill="var(--text-secondary)" fontSize="10">Pickup</text>

                    {/* Drop Node */}
                    <circle cx="320" cy="100" r="10" fill="rgba(241, 196, 15, 0.2)" />
                    <circle cx="320" cy="100" r="5" fill="var(--accent-color)" />
                    <text x="300" y="125" fill="var(--text-secondary)" fontSize="10">Destination</text>

                    {/* Live Moving Cab */}
                    <g transform={`translate(${mapPos.x}, ${mapPos.y})`} className="animate-float-car">
                      <path d="M -12 -5 L 12 -5 L 15 2 L -15 2 Z" fill="var(--accent-color)" />
                      <path d="M -8 -9 L 8 -9 L 10 -5 L -10 -5 Z" fill="#2c3e50" />
                      <circle cx="-6" cy="4" r="3" fill="#000" />
                      <circle cx="6" cy="4" r="3" fill="#000" />
                      
                      {/* Text callout on top of car */}
                      <rect x="-40" y="-30" width="80" height="16" rx="4" fill="var(--bg-tertiary)" stroke="var(--glass-border)" strokeWidth="0.5" />
                      <text x="0" y="-19" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">{mapPos.label}</text>
                    </g>
                  </svg>
                </div>

                {/* Progress Stepper Timeline */}
                <h5 className="fw-bold text-white mb-4">Ride Status Timeline</h5>
                <div className="d-flex justify-content-between text-center border-top border-secondary border-opacity-10 pt-4 px-2">
                  <div>
                    <i className={`bi bi-broadcast fs-4 d-block mb-1 ${getStepStatusClass('pending')}`}></i>
                    <span className="small text-secondary">Requested</span>
                  </div>
                  <div>
                    <i className={`bi bi-person-badge fs-4 d-block mb-1 ${getStepStatusClass('accepted')}`}></i>
                    <span className="small text-secondary">Driver Assigned</span>
                  </div>
                  <div>
                    <i className={`bi bi-signpost-2 fs-4 d-block mb-1 ${getStepStatusClass('started')}`}></i>
                    <span className="small text-secondary">In Transit</span>
                  </div>
                  <div>
                    <i className={`bi bi-check2-circle fs-4 d-block mb-1 ${getStepStatusClass('completed')}`}></i>
                    <span className="small text-secondary">Arrived</span>
                  </div>
                </div>
              </div>

              {/* Cashless Checkout Form */}
              {ride.status === 'completed' && !paymentSuccess && (
                <div className="glass-panel p-5 animate-fade-in-up">
                  <h4 className="fw-bold text-white mb-4"><i className="bi bi-credit-card text-warning me-2 animate-pulse-radar"></i>Cashless Card Checkout</h4>
                  <form onSubmit={handlePayment}>
                    <div className="mb-3">
                      <label className="text-secondary small mb-1 fw-semibold">CARD NUMBER</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="1111-2222-3333-4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <label className="text-secondary small mb-1 fw-semibold">EXPIRY</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="text-secondary small mb-1 fw-semibold">CVV</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-premium w-100 py-3" disabled={paymentLoading}>
                      {paymentLoading ? 'Processing Cashless Transfer...' : `Pay Fare \u20B9${ride.fare}`}
                    </button>
                  </form>
                </div>
              )}

              {/* Rating Feedback form */}
              {paymentSuccess && !ratingSuccess && (
                <div className="glass-panel p-5 animate-fade-in-up">
                  <h4 className="fw-bold text-white mb-4"><i className="bi bi-star-fill text-warning me-2 animate-pulse-radar"></i>Rate Your Driver</h4>
                  <form onSubmit={handleRating}>
                    <div className="mb-4 text-center">
                      <label className="text-secondary small d-block mb-3">Trips Concluded! How was your driver?</label>
                      <div className="btn-group gap-2" role="group">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`btn rounded-circle d-flex align-items-center justify-content-center ${
                              stars >= star ? 'btn-premium text-white' : 'btn-outline-secondary text-white'
                            }`}
                            style={{ width: '45px', height: '45px' }}
                            onClick={() => setStars(star)}
                          >
                            <i className="bi bi-star-fill"></i>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-secondary small mb-1 fw-semibold">COMMENTS / REVIEW</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Write feedback about the vehicle condition or driving..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-premium w-100 py-3" disabled={ratingLoading}>
                      {ratingLoading ? 'Submitting Feedback...' : 'Submit Rating & Exit'}
                    </button>
                  </form>
                </div>
              )}

              {ratingSuccess && (
                <div className="glass-panel p-5 text-center animate-fade-in-up">
                  <i className="bi bi-check-circle-fill text-success fs-1 mb-3 d-block"></i>
                  <h4 className="fw-bold text-white">Feedback Submitted!</h4>
                  <p className="text-secondary mb-0">Returning you back to dashboard...</p>
                </div>
              )}
            </div>

            {/* Visual telemetry dials & Ride details receipt card */}
            <div className="col-lg-5">
              {/* Futuristic HUD Telemetry dials */}
              <div className="glass-panel p-4 mb-4">
                <span className="text-secondary small fw-bold mb-3 d-block"><i className="bi bi-speedometer me-1 text-warning animate-pulse-radar"></i>LIVE GPS TELEMETRY HUD</span>
                <div className="row g-2 text-center">
                  <div className="col-6 border-end border-secondary border-opacity-10">
                    <span className="text-secondary small d-block">VEHICLE SPEED</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">{speed} <span className="fs-6 text-muted">km/h</span></h2>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary small d-block">GPS ETA</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">{Math.floor(etaSeconds / 60)}<span className="fs-6 text-muted">m</span> {etaSeconds % 60}<span className="fs-6 text-muted">s</span></h2>
                  </div>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="p-4 bg-dark bg-opacity-25 border-bottom border-secondary border-opacity-10">
                  <h5 className="fw-bold text-white mb-0">Trip Log Receipt</h5>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <span className="text-secondary small d-block">CAB VEHICLE</span>
                    <span className="text-white fw-bold">{ride.carId?.name || 'Cab Details'}</span>
                    <span className="badge bg-secondary ms-2">{ride.carId?.model}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-secondary small d-block">ASSIGNED DRIVER</span>
                    <span className="text-white fw-bold">
                      {ride.driverId ? (
                        <>
                          <i className="bi bi-person-fill text-warning me-1"></i>
                          {ride.driverId?.name}
                        </>
                      ) : (
                        <span className="text-muted">Searching for Driver...</span>
                      )}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-secondary small d-block">ROUTE DETAILS</span>
                    <span className="text-white small d-block"><i className="bi bi-circle-fill text-primary me-1 small"></i> {ride.pickupLocation}</span>
                    <span className="text-white small d-block mt-2"><i className="bi bi-geo-alt-fill text-warning me-1"></i> {ride.dropLocation}</span>
                  </div>

                  <div className="row g-2 border-top border-secondary border-opacity-25 pt-3">
                    <div className="col-6">
                      <span className="text-secondary small d-block">DATE & TIME</span>
                      <span className="text-light small fw-medium">{new Date(ride.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-secondary small d-block">FARE RATE</span>
                      <span className="text-warning fw-bold fs-4">&#8377;{ride.fare}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Copilot Chat Button & Drawer */}
      <div className="position-fixed" style={{ bottom: '24px', left: '24px', zIndex: 1050 }}>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="btn btn-premium rounded-circle d-flex align-items-center justify-content-center shadow-lg"
          style={{ width: '56px', height: '56px' }}
        >
          <i className="bi bi-robot fs-4"></i>
        </button>

        {chatOpen && (
          <div 
            className="glass-panel position-absolute p-4 animate-fade-in-up" 
            style={{ bottom: '70px', left: '0', width: '320px', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}
          >
            <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2 mb-3">
              <span className="text-white fw-bold small"><i className="bi bi-cpu text-warning animate-pulse-radar"></i> AI TRAVEL COPILOT</span>
              <button onClick={() => setChatOpen(false)} className="btn-close btn-close-white btn-sm" aria-label="Close"></button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow-1 overflow-y-auto mb-3 px-1" style={{ maxHeight: '260px' }}>
              {messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.sender === 'You' ? 'text-end' : 'text-start'}`}>
                  <span className="text-secondary d-block" style={{ fontSize: '8px' }}>{msg.sender}</span>
                  <div 
                    className={`d-inline-block rounded p-2 small ${
                      msg.sender === 'You' ? 'bg-warning text-dark' : 'bg-dark text-light border border-secondary border-opacity-20'
                    }`}
                    style={{ maxWidth: '85%' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ask: speed? eta? fare?"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-warning btn-sm text-dark"><i className="bi bi-send-fill"></i></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideTracking;
