import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, MessageSquare, ExternalLink, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import './ContactPage.css';

function DiscordIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

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
    <div className="contact-page-wrapper">
      <div className="app-container page-padded">
        {/* Header */}
        <div className="page-header">
          <span className="page-tag">Get In Touch</span>
          <h1 className="page-title">Let's Build Together</h1>
          <p className="page-subtitle">
            Have a question, event collaboration proposal, or want to get involved? Reach out anytime!
          </p>
        </div>

        <div className="contact-layout">
          {/* Left Column: 3D Sunset Connect Hub */}
          <div className="contact-3d-hub">
            <h3 className="contact-hub-title">Club Channels</h3>
            <p className="contact-hub-subtitle">
              Join our active community online or connect directly with our executive team.
            </p>

            <div className="contact-links-stack">
              <a 
                href="https://discord.gg/Fx7BUvzdzT" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-channel-pill"
              >
                <div className="channel-icon-circle discord">
                  <DiscordIcon size={18} color="#FFFFFF" />
                </div>
                <div className="channel-text">
                  <span className="channel-name">Community Discord</span>
                  <span className="channel-desc">Join 300+ student creators</span>
                </div>
                <ExternalLink size={14} className="channel-arrow" />
              </a>

              <a 
                href="https://www.instagram.com/uofs_uxcollective/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-channel-pill"
              >
                <div className="channel-icon-circle instagram">
                  <Instagram size={18} color="#FFFFFF" />
                </div>
                <div className="channel-text">
                  <span className="channel-name">Instagram</span>
                  <span className="channel-desc">@uofs_uxcollective</span>
                </div>
                <ExternalLink size={14} className="channel-arrow" />
              </a>

              <a 
                href="https://www.linkedin.com/company/uofs-ux-collective/posts/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-channel-pill"
              >
                <div className="channel-icon-circle linkedin">
                  <Linkedin size={18} color="#FFFFFF" />
                </div>
                <div className="channel-text">
                  <span className="channel-name">LinkedIn</span>
                  <span className="channel-desc">UX Collective USask</span>
                </div>
                <ExternalLink size={14} className="channel-arrow" />
              </a>

              <a 
                href="mailto:usaskuxcollective@ussu.ca" 
                className="contact-channel-pill"
              >
                <div className="channel-icon-circle email">
                  <Mail size={18} color="#FFFFFF" />
                </div>
                <div className="channel-text">
                  <span className="channel-name">Email</span>
                  <span className="channel-desc">usaskuxcollective@ussu.ca</span>
                </div>
                <ArrowRight size={14} className="channel-arrow" />
              </a>

              <div className="contact-location-tag">
                <MapPin size={16} color="#FA7538" />
                <span>University of Saskatchewan • Saskatoon, SK</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Form */}
          <div className="contact-form-card">
            {isSuccess && (
              <div className="success-alert">
                <CheckCircle2 size={20} color="#10B981" />
                <span>Thank you! Your message has been sent successfully. We'll be in touch soon.</span>
              </div>
            )}

            {errorMsg && (
              <div className="error-alert">
                <span>Error: {errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row-2col">
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
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  placeholder="Workshop idea / Question / Partnership" 
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
                  placeholder="Tell us what you'd like to collaborate or connect about..." 
                  className="form-textarea" 
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                <Send size={16} />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
