import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { io } from 'socket.io-client';
import { 
  Truck, CheckCircle, Package, Clock, MapPin, 
  Phone, ArrowLeft, Navigation, ShieldCheck,
  Calendar, Info, AlertTriangle
} from 'lucide-react';
import './OrderTracking.css';

const MapFocus = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);
  const [eta, setEta] = useState('Calculating...');
  const [distance, setDistance] = useState(0);

  // Initialize icons inside useMemo to ensure Leaflet (L) is ready and window is available
  const icons = useMemo(() => {
    try {
      if (typeof L === 'undefined') return null;
      return {
        destination: L.divIcon({
          html: `<div class="marker-pin destination-pin">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                 </div>`,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        }),
        agent: L.divIcon({
          html: `<div class="marker-pin agent-pin">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2l-6.4 17.6c-.4 1.1.6 2.1 1.7 1.7L12 18l6.7 3.3c1.1.4 2.1-.6 1.7-1.7L14 2h-4Z"/></svg>
                 </div>`,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
      };
    } catch (e) {
      console.error('Marker initialization failed', e);
      return null;
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
        
        if (data.orderStatus === 'out_for_delivery' || data.orderStatus === 'dispatched') {
          // Hub Location: Baneshwor Hub
          const hubLat = 27.6915;
          const hubLng = 85.3420;
          setAgentLocation([hubLat, hubLng]);
          
          const destLat = data.deliveryAddress?.coordinates?.lat || 27.7007;
          const destLng = data.deliveryAddress?.coordinates?.lng || 85.3001;
          
          const dist = calculateDistance(hubLat, hubLng, destLat, destLng);
          // Assuming 20km/h avg speed in Kathmandu traffic + 10 mins buffer
          const timeMinutes = Math.round((dist / 20) * 60) + 10;
          
          setDistance(dist);
          setEta(`${timeMinutes} mins`);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Connection to tracking system failed');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.emit('join_order_tracking', id);

    socket.on('order_status_updated', (data) => {
      setOrder(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          orderStatus: data.status,
          statusHistory: [...(prev.statusHistory || []), { status: data.status, note: data.note, timestamp: new Date() }]
        };
      });
    });

    socket.on('delivery_location_changed', (coords) => {
      if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && order) {
        setAgentLocation([coords.lat, coords.lng]);
        
        const destLat = order.deliveryAddress?.coordinates?.lat || 27.7007;
        const destLng = order.deliveryAddress?.coordinates?.lng || 85.3001;
        
        const dist = calculateDistance(coords.lat, coords.lng, destLat, destLng);
        const timeMinutes = Math.round((dist / 20) * 60) + 2; // Real-time buffer
        setDistance(dist);
        setEta(`${timeMinutes} mins`);
      }
    });

    return () => socket.disconnect();
  }, [id]);

  if (loading) return (
    <div className="tracking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--tracking-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--tracking-text-muted)', fontWeight: '600', letterSpacing: '1px' }}>SYNCHRONIZING LOGISTICS...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="tracking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: 'var(--tracking-card)', padding: '50px', borderRadius: '32px', border: '1px solid var(--tracking-border)', maxWidth: '500px' }}>
        <AlertTriangle size={64} color="var(--tracking-accent)" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Tracking Unavailable</h2>
        <p style={{ color: 'var(--tracking-text-muted)', marginBottom: '30px' }}>{error || 'We could not find an active shipment with this ID.'}</p>
        <Link to="/track" className="btn-back" style={{ color: 'white', background: 'var(--tracking-accent)', padding: '12px 30px', borderRadius: '15px', textDecoration: 'none', fontWeight: '700' }}>Try Another ID</Link>
      </div>
    </div>
  );

  const steps = [
    { status: 'pending', icon: <Package />, label: 'Order Confirmed' },
    { status: 'processing', icon: <Calendar />, label: 'In Production' },
    { status: 'dispatched', icon: <Truck />, label: 'Out for Transit' },
    { status: 'delivered', icon: <CheckCircle />, label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => {
    if (order.orderStatus === 'out_for_delivery') return s.status === 'dispatched';
    if (order.orderStatus === 'approved') return s.status === 'pending';
    return s.status === order.orderStatus;
  });

  const destination = order.deliveryAddress?.coordinates?.lat 
    ? [order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng]
    : [27.7007, 85.3001]; 

  return (
    <div className="tracking-page">
      <div className="container">
        <Link to="/dashboard" className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tracking-text-muted)', textDecoration: 'none', marginBottom: '30px', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <ArrowLeft size={18} /> Back to Command Center
        </Link>

        <div className="tracking-info-header">
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--tracking-accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>Real-time Shipment</label>
            <h1>Shipment ID: #{order.orderId}</h1>
          </div>
          <div className="order-id-badge">
            <ShieldCheck size={22} style={{ marginRight: '10px' }} /> COLORNEST CERTIFIED
          </div>
        </div>

        <div className="tracking-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
          <div className="tracking-visual-area">
            <div className="live-map-container">
              <div className="map-overlay-stats">
                <div className="stat-group">
                  <label>Current Stage</label>
                  <span style={{ color: 'var(--tracking-accent)' }}>{(order.orderStatus || 'pending').replace('_', ' ')}</span>
                </div>
                <div className="stat-group">
                  <label>ETA</label>
                  <span>{order.orderStatus === 'delivered' ? 'Completed' : eta}</span>
                </div>
                <div className="stat-group">
                  <label>Range</label>
                  <span>{order.orderStatus === 'delivered' ? '0 km' : `${distance.toFixed(1)} km`}</span>
                </div>
              </div>

              {destination && icons && (
                <MapContainer 
                  center={destination} 
                  zoom={13} 
                  scrollWheelZoom={false} 
                  style={{ height: '100%', width: '100%' }}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <AttributionControl position="bottomright" prefix={false} />
                  
                  
                  <Marker position={destination} icon={icons.destination}>
                    <Popup>
                      <strong>Destination Point</strong><br />
                      {order.deliveryAddress?.street || 'Customer Address'}
                    </Popup>
                  </Marker>

                  {agentLocation && order.orderStatus !== 'delivered' && (
                    <>
                      <Marker position={agentLocation} icon={icons.agent}>
                        <Popup>
                          <strong>ColorNest Courier</strong><br />
                          En-route to your location
                        </Popup>
                      </Marker>
                      <MapFocus center={agentLocation} />
                    </>
                  )}
                </MapContainer>
              )}
            </div>

            {order.deliveryPartner?.name && (
              <div className="agent-info-card" style={{ marginTop: '30px' }}>
                <div className="agent-avatar"><Truck size={36} /></div>
                <div className="agent-details">
                  <h4>{order.deliveryPartner.name}</h4>
                  <p>Certified Master Courier • Specialized Transit</p>
                </div>
                <button className="btn-call-agent" onClick={() => window.location.href = `tel:${order.deliveryPartner.phone?.replace(/\s/g, '')}`}>
                  <Phone size={24} />
                </button>
              </div>
            )}
          </div>

          <div className="tracking-sidebar">
            <div className="status-timeline-card">
              <h3>Journey Milestones</h3>
              <div className="timeline">
                {steps.map((step, index) => (
                  <div key={step.status} className={`timeline-item ${index <= currentStepIndex ? 'active' : ''}`}>
                    <div className="timeline-icon">
                      {index <= currentStepIndex ? <CheckCircle size={20} /> : step.icon}
                    </div>
                    <div className="timeline-content">
                      <h4>{step.label}</h4>
                      <span>{index <= currentStepIndex ? 'Activity successfully logged' : 'Awaiting transit data'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shipment-contents-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Shipment Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {order.items?.map(item => (
                  <div key={item._id} className="content-row">
                    <span style={{ color: 'var(--tracking-text-muted)', fontWeight: '600' }}>{item.paint?.name || 'Item'} × {item.quantity || 0}</span>
                    <span style={{ fontWeight: '800' }}>Rs. {Number(item.total || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid var(--tracking-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--tracking-text-muted)' }}>Fulfillment Total</span>
                <span style={{ color: 'var(--tracking-accent)', fontSize: '1.6rem', fontWeight: '900' }}>Rs. {Number(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

