import React from 'react';

const Contact = () => {
  return (
    <div className="container">
      <h1>Contact Jah's Jamaican Cuisine</h1>
      
      <div className="contact-grid">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <div className="contact-item">
            <h3>Phone</h3>
            <p>876-555-JAMS</p>
          </div>
          <div className="contact-item">
            <h3>Email</h3>
            <p>info@jahsjamaicancuisine.com</p>
          </div>
          <div className="contact-item">
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
        
        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;