import React, { useState, useEffect } from 'react';
import { Beaker, Save, Printer, RefreshCw, BookOpen, Droplets, PaintBucket, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminColorMixing.css';

const PREDEFINED_RECIPES = [
  { id: 1, name: 'Ocean Mist', hex: '#8cd3d6', bases: { white: 70, blue: 20, green: 10 } },
  { id: 2, name: 'Sunset Terracotta', hex: '#e2725b', bases: { white: 30, red: 50, yellow: 20 } },
  { id: 3, name: 'Forest Depth', hex: '#2c5e4f', bases: { black: 40, green: 40, blue: 20 } },
  { id: 4, name: 'Royal Plum', hex: '#5b3256', bases: { red: 45, blue: 35, black: 20 } },
];

const BASE_COLORS = [
  { id: 'white', name: 'Titanium White', hex: '#ffffff' },
  { id: 'black', name: 'Carbon Black', hex: '#1a1a1a' },
  { id: 'red', name: 'Crimson Red', hex: '#dc2626' },
  { id: 'blue', name: 'Cobalt Blue', hex: '#2563eb' },
  { id: 'yellow', name: 'Chrome Yellow', hex: '#facc15' },
  { id: 'green', name: 'Phthalo Green', hex: '#16a34a' }
];

const AdminColorMixing = () => {
  const [targetHex, setTargetHex] = useState('#8cd3d6');
  const [volumeLiters, setVolumeLiters] = useState(1);
  const [mix, setMix] = useState({ white: 70, blue: 20, green: 10, black: 0, red: 0, yellow: 0 });

  // Simulate calculating mix from hex (simplified for demo)
  const calculateMix = (hex) => {
    // In a real system, this would use complex color matching algorithms (e.g., Delta E)
    // Here we just randomly generate a plausible mix or match predefined
    const predefined = PREDEFINED_RECIPES.find(r => r.hex.toLowerCase() === hex.toLowerCase());
    if (predefined) {
      setMix({ white: 0, black: 0, red: 0, blue: 0, yellow: 0, green: 0, ...predefined.bases });
    } else {
      // Fake calculation
      setMix({
        white: Math.floor(Math.random() * 50) + 10,
        black: Math.floor(Math.random() * 20),
        red: Math.floor(Math.random() * 30),
        blue: Math.floor(Math.random() * 30),
        yellow: Math.floor(Math.random() * 20),
        green: 0
      });
      toast.success('Generated custom mixing recipe');
    }
  };

  const handleHexChange = (e) => {
    setTargetHex(e.target.value);
  };

  const applyCalculation = () => {
    calculateMix(targetHex);
  };

  const handleSliderChange = (base, value) => {
    setMix(prev => ({ ...prev, [base]: parseInt(value) }));
  };

  // Calculate combined RGB visually
  const getSimulatedColor = () => {
    // Highly simplified additive blending for visual feedback only
    let r = 0, g = 0, b = 0, total = 0;
    
    if (mix.white) { r+=255*mix.white; g+=255*mix.white; b+=255*mix.white; total+=mix.white; }
    if (mix.black) { r+=26*mix.black; g+=26*mix.black; b+=26*mix.black; total+=mix.black; }
    if (mix.red)   { r+=220*mix.red; g+=38*mix.red; b+=38*mix.red; total+=mix.red; }
    if (mix.blue)  { r+=37*mix.blue; g+=99*mix.blue; b+=235*mix.blue; total+=mix.blue; }
    if (mix.yellow){ r+=250*mix.yellow; g+=204*mix.yellow; b+=21*mix.yellow; total+=mix.yellow; }
    if (mix.green) { r+=22*mix.green; g+=163*mix.green; b+=74*mix.green; total+=mix.green; }

    if (total === 0) return '#ffffff';
    
    r = Math.floor(r/total);
    g = Math.floor(g/total);
    b = Math.floor(b/total);
    
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const currentSimulation = getSimulatedColor();
  const totalRatio = Object.values(mix).reduce((a,b) => a+b, 0) || 1;

  const handlePrint = () => {
    window.print();
    toast.success('Preparing recipe for printing');
  };

  return (
    <div className="color-mixing-page animate-fade">
      <div className="mixing-header">
        <div>
          <h1>Color Management & Mixing</h1>
          <p>Smart calculator and digital formulation guide for Nippo Paints.</p>
        </div>
        <div className="action-buttons">
          <button className="btn-export" onClick={() => toast.success('Recipe saved to library')}>
            <Save size={18} /> Save Formula
          </button>
          <button className="btn-export" onClick={handlePrint}>
            <Printer size={18} /> Print Recipe
          </button>
        </div>
      </div>

      <div className="mixing-grid">
        {/* Left Column: Calculator & Controls */}
        <div className="calculator-area">
          <div className="calculator-card">
            <h2><Beaker color="var(--primary)" /> Formulation Engine</h2>
            
            <div className="target-color-input">
              <label>Target Color Match</label>
              <div className="color-picker-group">
                <input 
                  type="color" 
                  value={targetHex} 
                  onChange={handleHexChange}
                />
                <input 
                  type="text" 
                  className="hex-input" 
                  value={targetHex} 
                  onChange={handleHexChange}
                  placeholder="#000000"
                />
                <button className="btn btn-primary" onClick={applyCalculation} style={{ padding: '15px 20px', borderRadius: '14px' }}>
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div className="base-colors-section">
              <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} /> Adjust Base Proportions
              </h3>
              
              {BASE_COLORS.map(base => (
                <div key={base.id} className="base-color-slider">
                  <div className="slider-header">
                    <label>
                      <span className="color-dot" style={{ background: base.hex }}></span>
                      {base.name}
                    </label>
                    <span className="ratio-value">{mix[base.id]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={mix[base.id]} 
                    onChange={(e) => handleSliderChange(base.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Output */}
        <div className="preview-area">
          <div className="preview-card">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PaintBucket color="var(--primary)" /> Final Output
            </h2>
            
            <div className="visual-preview" style={{ background: currentSimulation }}>
              <div className="preview-overlay-text">
                {currentSimulation.toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px', color: '#475569' }}>Production Volume</label>
              <div className="volume-input-group">
                <Droplets size={20} color="#94a3b8" />
                <input 
                  type="number" 
                  min="1" 
                  value={volumeLiters} 
                  onChange={(e) => setVolumeLiters(e.target.value)}
                />
                <span>Liters</span>
              </div>
            </div>

            <div className="recipe-output" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <h4 style={{ margin: '0 0 15px', color: '#1e293b' }}>Required Base Quantities</h4>
              {BASE_COLORS.filter(b => mix[b.id] > 0).map(base => {
                const requiredLiters = ((mix[base.id] / totalRatio) * volumeLiters).toFixed(2);
                return (
                  <div key={base.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#475569' }}>
                      <span className="color-dot" style={{ background: base.hex, width: '12px', height: '12px' }}></span>
                      {base.name}
                    </span>
                    <strong style={{ color: 'var(--primary)' }}>{requiredLiters} L</strong>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Library Section */}
      <div className="color-library-section">
        <div className="library-header">
          <h3><BookOpen size={24} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle', color: 'var(--primary)' }} /> Digital Color Guide</h3>
          <button className="btn btn-outline">Browse Full Library</button>
        </div>
        
        <div className="library-grid">
          {PREDEFINED_RECIPES.map(recipe => (
            <div key={recipe.id} className="recipe-card" onClick={() => {
              setTargetHex(recipe.hex);
              setMix({ white: 0, black: 0, red: 0, blue: 0, yellow: 0, green: 0, ...recipe.bases });
              toast.success(`Loaded recipe: ${recipe.name}`);
            }}>
              <div className="recipe-color-preview" style={{ background: recipe.hex }}></div>
              <h4>{recipe.name}</h4>
              <p>Hex: {recipe.hex.toUpperCase()}</p>
              
              <div className="recipe-breakdown">
                {Object.entries(recipe.bases).map(([baseId, ratio]) => {
                  const baseData = BASE_COLORS.find(b => b.id === baseId);
                  return (
                    <div 
                      key={baseId} 
                      className="breakdown-item" 
                      style={{ background: baseData?.hex, flexGrow: ratio }}
                      title={`${baseData?.name}: ${ratio}%`}
                    ></div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminColorMixing;
