import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { BuildInfo } from '../App';
import type { FirebaseContextValue } from '../services/firebase';
import { ErrorBanner } from '../components/ErrorBanner';

export const DebugPage = ({
  firebase,
  buildInfo
}: {
  firebase: FirebaseContextValue;
  buildInfo?: BuildInfo;
}) => {
  const [writeStatus, setWriteStatus] = useState<string>('Not started');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  const buildShaShort = (buildInfo?.sha ?? 'dev').slice(0, 7);
  const buildTime = buildInfo?.time ?? 'local';
  const projectId = firebase.app.options.projectId ?? '(missing projectId)';
  const authDomain = firebase.app.options.authDomain ?? '(missing authDomain)';
  const hostingSite =
    typeof window !== 'undefined' ? window.location.hostname : '(unknown host)';

  const handleTestWrite = async () => {
    setIsWriting(true);
    setErrorMessage(null);
    setWriteStatus('Writing DEBUG_WRITE_TEST event…');

    try {
      const docRef = await addDoc(collection(firebase.db, 'clientLogs'), {
        type: 'DEBUG_WRITE_TEST',
        projectId,
        authDomain,
        hostingSite,
        buildSha: buildInfo?.sha ?? 'dev',
        buildTime,
        ts: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      setWriteStatus(`Success. clientLogs/${docRef.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Firestore write error';
      setErrorMessage(`Firestore write failed: ${message}`);
      setWriteStatus('Failed');
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="cm-shell" style={{ gridTemplateColumns: '1fr' }}>
      <section className="cm-panel">
        <div className="cm-panel-hd">
          <div className="cm-title">Deployment sanity check</div>
        </div>
        <div className="cm-panel-bd cm-stack" style={{ fontSize: 13 }}>
          {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

          <div>
            <strong>Build SHA:</strong> {buildShaShort}
          </div>
          <div>
            <strong>Build time:</strong> {buildTime}
          </div>
          <div>
            <strong>Firebase projectId:</strong> {projectId}
          </div>
          <div>
            <strong>Firebase authDomain:</strong> {authDomain}
          </div>
          <div>
            <strong>Hosting site (current hostname):</strong> {hostingSite}
          </div>

          <div className="cm-row" style={{ alignItems: 'center' }}>
            <button type="button" className="cm-btn cm-btn-good" onClick={handleTestWrite} disabled={isWriting}>
              {isWriting ? 'Writing…' : 'Test Firestore write'}
            </button>
            <span className="cm-muted">Result: {writeStatus}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
