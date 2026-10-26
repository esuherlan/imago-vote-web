import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVote, castBallot, ApiError } from '../api.js';
import { getVoterToken } from '../voter.js';
import Shell from '../components/Shell.jsx';
import Message from '../components/Message.jsx';

const POLL_MS = 4000;

const ERROR_TEXT = {
  already_voted: 'You have already voted.',
  not_open: 'Voting is closed.',
  name_required: 'Name is required.',
  invalid_option: 'Invalid option.',
};

export default function VotePage() {
  const { code } = useParams();
  const [vote, setVote] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | notfound | error
  const [optionId, setOptionId] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getVote(code, getVoterToken());
      setVote(data);
      setState('ready');
    } catch (err) {
      setState(err instanceof ApiError && err.status === 404 ? 'notfound' : 'error');
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh while the vote has not been opened yet.
  useEffect(() => {
    if (vote?.status !== 'draft') return undefined;
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [vote?.status, load]);

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await castBallot(code, {
        optionId,
        voterToken: getVoterToken(),
        ...(vote.mode === 'real_name' ? { voterName: name.trim() } : {}),
      });
      setDone(true);
    } catch (err) {
      if (err.code === 'already_voted') setDone(true);
      else setFormError(ERROR_TEXT[err.code] || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (state === 'loading') {
    return (
      <Shell>
        <div className="skeleton" aria-busy="true" aria-label="Loading">
          <span className="sk sk-title" />
          <span className="sk sk-row" />
          <span className="sk sk-row" />
          <span className="sk sk-row" />
        </div>
      </Shell>
    );
  }
  if (state === 'notfound') {
    return <Shell><Message tone="search" title="Vote not found" text="Check the QR code again or ask your teacher to show it again." /></Shell>;
  }
  if (state === 'error') {
    return (
      <Shell>
        <Message tone="error" title="Failed to load" text="Check your internet connection and try again.">
          <button className="btn" onClick={load}>Try again</button>
        </Message>
      </Shell>
    );
  }
  if (done || vote.hasVoted) {
    return <Shell><Message tone="success" title="Thank you!" text="Your vote has been recorded." /></Shell>;
  }
  if (vote.status === 'draft') {
    return (
      <Shell>
        <Message tone="wait" title={vote.title} text="Voting hasn't opened yet. This page will update automatically once it starts." />
      </Shell>
    );
  }
  if (vote.status === 'closed') {
    return <Shell><Message tone="closed" title={vote.title} text="Voting is closed." /></Shell>;
  }

  const needName = vote.mode === 'real_name';
  const canSubmit = optionId && (!needName || name.trim()) && !submitting;

  return (
    <Shell>
      <form className="vote-form" onSubmit={submit}>
        <header className="question">
          <span className="pill">{needName ? 'Name required' : 'Anonymous'}</span>
          <p className="eyebrow">Question</p>
          <h1 id="question-title">{vote.title}</h1>
        </header>

        <fieldset className="choices" aria-labelledby="question-title">
          <legend className="legend">Choose one answer</legend>
          <div className="options">
            {vote.options.map((o, i) => (
              <label key={o.id} className={`option${optionId === o.id ? ' selected' : ''}`}>
                <input type="radio" name="option" value={o.id} checked={optionId === o.id} onChange={() => setOptionId(o.id)} />
                <span className="option-key" aria-hidden="true">
                  <span className="k-letter">{String.fromCharCode(65 + (i % 26))}</span>
                  <svg className="k-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <span className="option-label">{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {needName && (
          <label className="field">
            <span>Your name <abbr className="req" title="required" aria-hidden="true">*</abbr></span>
            <input
              value={name}
              maxLength={100}
              placeholder="Enter your name"
              required
              aria-required="true"
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}

        {formError && <p className="error" role="alert">{formError}</p>}

        <div className="actions">
          <button className="btn" type="submit" disabled={!canSubmit}>
            {submitting ? 'Sending…' : (
              <>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Submit vote
              </>
            )}
          </button>
        </div>
      </form>
    </Shell>
  );
}
