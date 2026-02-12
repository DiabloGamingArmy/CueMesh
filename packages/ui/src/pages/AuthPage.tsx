import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import type { FirebaseContextValue } from '../services/firebase';

export const AuthPage = ({ firebase }: { firebase: FirebaseContextValue }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth(firebase.app);

  useEffect(() => {
    if (firebase.user) {
      navigate('/', { replace: true });
    }
  }, [firebase.user, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="cm-shell" style={{ gridTemplateColumns: '1fr' }}>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Welcome to CueMesh</div>
          <div className="cm-row">
            <button
              type="button"
              className={`cm-btn ${mode === 'signin' ? 'cm-btn-good' : ''}`}
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`cm-btn ${mode === 'signup' ? 'cm-btn-good' : ''}`}
              onClick={() => setMode('signup')}
            >
              Create Account
            </button>
          </div>
        </div>
        <div className="cm-panel-bd">
          <form className="cm-stack" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error ? <div className="cm-chip">{error}</div> : null}
            <button className="cm-btn cm-btn-good" type="submit">
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
