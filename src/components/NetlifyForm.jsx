import { useRef, useState } from 'react';

const encode = (data) =>
  Object.keys(data)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
    .join('&');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Renders a Netlify-handled form. The matching static markup lives in
 * public/forms.html so Netlify's build-time parser registers each form.
 */
export default function NetlifyForm({
  name,
  fields,
  consentLabel,
  submitLabel = 'Send',
  successTitle,
  successBody,
  privacyNote,
  formAction = '/',
  legend,
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, ''])),
  );
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const errorSummary = useRef(null);
  const formEl = useRef(null);

  const set = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const validate = () => {
    const found = {};
    fields.forEach((f) => {
      const value = values[f.name].trim();
      if (f.required && !value) {
        found[f.name] = `${f.label} is required.`;
      } else if (value && f.type === 'email' && !EMAIL.test(value)) {
        found[f.name] = 'Enter an email address in the format name@example.com.';
      } else if (value && f.type === 'tel' && value.replace(/\D/g, '').length < 7) {
        found[f.name] = 'Enter a phone number including the area code.';
      }
    });
    if (!consent) found.consent = 'Please confirm before sending.';
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus('idle');
      // Focus the first invalid control so a keyboard user lands on the problem,
      // not on a summary they then have to navigate away from.
      requestAnimationFrame(() => {
        const firstKey = fields.find((f) => found[f.name])?.name;
        const target = firstKey
          ? formEl.current?.querySelector(`[name="${firstKey}"]`)
          : formEl.current?.querySelector('[name="consent"]');
        if (target) target.focus();
        else errorSummary.current?.focus();
      });
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(formAction, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': name,
          ...values,
          consent: 'yes',
          'bot-field': '',
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="notice" role="status">
        <h2 className="h3" style={{ marginBottom: '0.5rem' }}>{successTitle}</h2>
        <p style={{ marginBottom: 0 }}>{successBody}</p>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form
      className="form"
      ref={formEl}
      action={formAction}
      name={name}
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      noValidate
    >
      <input type="hidden" name="form-name" value={name} />
      <p className="honeypot">
        <label>
          Leave this field empty if you are human
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      {errorCount > 0 && (
        <div
          className="notice"
          role="alert"
          tabIndex={-1}
          ref={errorSummary}
        >
          <p style={{ marginBottom: 0, fontWeight: 600 }}>
            {errorCount === 1
              ? 'One field needs attention before this can be sent.'
              : `${errorCount} fields need attention before this can be sent.`}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="notice" role="alert">
          <p style={{ marginBottom: 0 }}>
            This did not send. Check your connection and try again, or reach out
            through another channel listed on this site.
          </p>
        </div>
      )}

      {legend && <legend className="form__legend">{legend}</legend>}

      {fields.map((field) => {
        const id = `${name}-${field.name}`;
        const invalid = Boolean(errors[field.name]);
        const describedBy = [
          invalid ? `${id}-error` : null,
          field.hint ? `${id}-hint` : null,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div className="field" key={field.name}>
            <label htmlFor={id}>
              {field.label}
              {field.hideRequirement !== true && (
                <span className="muted">{field.required ? ' (required)' : ' (optional)'}</span>
              )}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={id}
                name={field.name}
                value={values[field.name]}
                required={field.required}
                placeholder={field.placeholder}
                aria-invalid={invalid}
                aria-describedby={describedBy || undefined}
                onChange={(e) => set(field.name, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <select
                id={id}
                name={field.name}
                value={values[field.name]}
                required={field.required}
                aria-invalid={invalid}
                aria-describedby={describedBy || undefined}
                onChange={(e) => set(field.name, e.target.value)}
              >
                <option value="">Choose one</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={field.name}
                type={field.type || 'text'}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                required={field.required}
                aria-invalid={invalid}
                aria-describedby={describedBy || undefined}
                onChange={(e) => set(field.name, e.target.value)}
              />
            )}
            {field.hint && (
              <span className="privacy" id={`${id}-hint`} style={{ marginTop: '0.4rem', display: 'block' }}>
                {field.hint}
              </span>
            )}
            {invalid && (
              <span className="field__error" id={`${id}-error`}>
                {errors[field.name]}
              </span>
            )}
          </div>
        );
      })}

      <div className="checkbox">
        <input
          id={`${name}-consent`}
          name="consent"
          type="checkbox"
          checked={consent}
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? `${name}-consent-error` : undefined}
          onChange={(e) => {
            setConsent(e.target.checked);
            setErrors((prev) => {
              const next = { ...prev };
              delete next.consent;
              return next;
            });
          }}
        />
        <label htmlFor={`${name}-consent`}>
          {consentLabel}
          {errors.consent && (
            <span className="field__error" id={`${name}-consent-error`}>
              {errors.consent}
            </span>
          )}
        </label>
      </div>

      <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending\u2026' : submitLabel}
      </button>

      {privacyNote && <p className="privacy">{privacyNote}</p>}
    </form>
  );
}
