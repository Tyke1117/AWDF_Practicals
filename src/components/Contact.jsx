import { useState } from 'react';

export default function Contact() {
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Contact Me</h1>

      <div style={{ marginTop: '24px', textAlign: 'left' }}>
        <label
          htmlFor="contact-message"
          style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-h)' }}
        >
          Your Message:
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '16px',
            fontFamily: 'var(--sans)',
            resize: 'vertical',
            boxSizing: 'border-box',
            background: 'var(--code-bg)',
            color: 'var(--text-h)',
          }}
        />
        <p
          style={{
            fontSize: '14px',
            marginTop: '6px',
            marginBottom: 0,
            color: 'var(--text)',
          }}
        >
          Character count: {message.length}
        </p>

        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => setShowHelp((prev) => !prev)}
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              borderRadius: '8px',
              padding: '8px 20px',
              cursor: 'pointer',
              color: 'var(--text-h)',
              fontSize: '14px',
            }}
          >
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>

          {showHelp && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--code-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '14px',
              }}
            >
              💡 Type your message in the textarea above. The character count updates in real time!
            </div>
          )}
        </div>

        {message && (
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-h)' }}>Your message preview:</p>
            <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

