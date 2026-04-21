import React from 'react';
import './FAQ.css';

const FAQ = () => {
  const faqs = [
    { q: "How long does the paint take to dry?", a: "Touch dry in 30 mins, recoat after 4 hours." },
    { q: "Do you deliver outside Kathmandu?", a: "Yes, we deliver to all 77 districts of Nepal." },
    { q: "What is the delivery charge?", a: "It depends on your location. Standard charge is Rs. 150." },
    { q: "How can I pay?", a: "We accept eSewa, Khalti, and Cash on Delivery." }
  ];

  return (
    <div className="faq-page container">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <div key={i} className="faq-item card">
            <h3>{faq.q}</h3>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
