import React, { useState } from 'react';
import { Calculator, Info, RefreshCw } from 'lucide-react';
import './CalculatorPage.css';

const CalculatorPage = () => {
  const [area, setArea] = useState('');
  const [layers, setLayers] = useState(2);
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    if (!area) return;
    
    // Standard coverage: 120 sq ft per liter for 1 coat
    const coveragePerLiter = 120;
    const totalLiters = (parseFloat(area) / coveragePerLiter) * layers;
    const finalLiters = Math.ceil(totalLiters);
    
    // Breakdown into cans (10L, 4L, 1L)
    let remaining = finalLiters;
    const cans = {
      p10: Math.floor(remaining / 10),
      p4: Math.floor((remaining % 10) / 4),
      p1: Math.ceil((remaining % 10) % 4)
    };
    
    setResult({ total: finalLiters, breakdown: cans });
  };

  return (
    <div className="calculator-page container">
      <div className="calc-container card animate-fade">
        <div className="calc-header">
          <div className="calc-icon-box">
            <Calculator size={40} />
          </div>
          <h1>Precision Paint Estimator</h1>
          <p>Get the exact amount of paint required for your specific area.</p>
        </div>

        <form onSubmit={calculate} className="calc-form">
          <div className="form-group">
            <label>Total Wall Surface Area (sq. ft.)</label>
            <input 
              type="number" 
              placeholder="e.g. 1200" 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Desired Number of Coats</label>
            <div className="radio-group">
              {[1, 2, 3].map(num => (
                <label key={num} className={`radio-btn ${layers == num ? 'active' : ''}`}>
                  <input type="radio" name="layers" value={num} checked={layers == num} onChange={e => setLayers(e.target.value)} />
                  {num} {num === 1 ? 'Coat' : 'Coats'}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary full-width calc-btn">
            Calculate Requirements
          </button>
        </form>

        {result && (
          <div className="result-box animate-fade">
            <div className="result-main">
              <span className="liters-count">{result.total}</span>
              <span className="liters-label">Liters Needed</span>
            </div>
            
            <div className="can-breakdown">
              <h4>Recommended Cans:</h4>
              <div className="cans-grid">
                {result.breakdown.p10 > 0 && <div className="can-item"><span>{result.breakdown.p10}</span> × 10L Bucket</div>}
                {result.breakdown.p4 > 0 && <div className="can-item"><span>{result.breakdown.p4}</span> × 4L Can</div>}
                {result.breakdown.p1 > 0 && <div className="can-item"><span>{result.breakdown.p1}</span> × 1L Can</div>}
              </div>
            </div>

            <p className="coverage-info"><Info size={14} /> Based on premium coverage of 120 sq.ft/Liter.</p>
            <button className="reset-btn" onClick={() => {setArea(''); setResult(null);}}>
              <RefreshCw size={14} /> Start Over
            </button>
          </div>
        )}
      </div>

      <div className="calc-info card">
        <h3>How to measure your walls?</h3>
        <ul>
          <li>Measure the height and width of each wall.</li>
          <li>Multiply height by width to get the area.</li>
          <li>Subtract areas of windows and doors.</li>
          <li>Add all wall areas together for the total.</li>
        </ul>
      </div>
    </div>
  );
};

export default CalculatorPage;
