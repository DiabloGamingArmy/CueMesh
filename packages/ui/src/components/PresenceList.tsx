import './presence.css';

type PresenceMember = {
  id: string;
  displayName?: string;
  role?: string;
  presence?: { online?: boolean; lastSeenAt?: string };
};

export const PresenceList = ({ members }: { members: PresenceMember[] }) => {
  return (
    <section className="panel">
      <h3>Presence</h3>
      <ul className="presence-list">
        {members.map((member) => (
          <li key={member.id}>
            <span className={member.presence?.online ? 'dot online' : 'dot'} />
            <div>
              <div className="name">{member.displayName ?? member.id}</div>
              <div className="meta">{member.role ?? 'Unknown role'}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
