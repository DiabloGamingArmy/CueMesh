import './presence.css';

type PresenceMember = {
  id: string;
  displayName?: string;
  department?: string;
  presence?: { online?: boolean; lastSeenAt?: string };
  customDeptLabel?: string | null;
};

export const PresenceList = ({ members }: { members: PresenceMember[] }) => {
  return (
    <ul className="presence-list">
      {members.map((member) => (
        <li key={member.id}>
          <span className={member.presence?.online ? 'dot online' : 'dot'} />
          <div>
            <div className="name">{member.displayName ?? member.id}</div>
            <div className="meta">
              {member.department === 'CUSTOM'
                ? member.customDeptLabel ?? 'Custom'
                : member.department ?? 'Unknown department'}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
