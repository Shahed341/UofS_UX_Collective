import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setIsSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contact form');
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <span className="page-tag">Get In Touch</span>
        <h2 className="page-title">Connect with UofS UX Collective</h2>
        <p className="page-subtitle">
          Have questions about our events, want to join the executive team, or propose a design collaboration? We’d love to hear from you!
        </p>
      </div>

      <div className="contact-layout">
        <div className="contact-info-card">
          <h3 className="contact-info-title">Club Headquarters</h3>
          <p className="contact-info-desc">
            The University of Saskatchewan UX Collective is an official ratified student group under the USSU based in Saskatoon, Saskatchewan.
          </p>

          <div className="contact-item-list">
            <div className="contact-item">
              <MapPin size={18} color="#E81D88" />
              <span>University of Saskatchewan, Saskatoon, SK</span>
            </div>
            <div className="contact-item">
              <Mail size={18} color="#FA9B7A" />
              <a href="mailto:usaskuxcollective@ussu.ca" style={{ color: 'inherit', textDecoration: 'underline' }}>
                usaskuxcollective@ussu.ca
              </a>
            </div>
            <div className="contact-item">
              <MessageSquare size={18} color="#5865F2" />
              <a 
                href="https://discord.gg/Fx7BUvzdzT" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#5865F2', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Join UXCO Discord Server <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-card">
          {isSuccess && (
            <div className="success-alert">
              <CheckCircle2 size={18} />
              <span>Thank you! Your message has been saved into our MySQL database (`contact_submissions`).</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ color: '#EF4444', marginBottom: '14px', fontSize: '13px', fontWeight: '600' }}>
              Error: {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="e.g. Alex Morgan" 
                className="form-input" 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="alex.m@usask.ca" 
                className="form-input" 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input 
                type="text" 
                name="subject" 
                placeholder="Workshop idea / Executive Team application / Question" 
                className="form-input" 
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea 
                name="message" 
                required 
                placeholder="Tell us what you'd like to connect about..." 
                className="form-textarea" 
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              <Send size={16} />
              {isSubmitting ? 'Submitting to Database...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
