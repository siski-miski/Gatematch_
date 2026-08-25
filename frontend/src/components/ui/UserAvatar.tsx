import type { User } from '../../types';

export default function UserAvatar({ user, size = 72, className = '' }: { user: Pick<User, 'full_name' | 'avatar_url'>; size?: number; className?: string }) {
    const initials = user.full_name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--navy)',
                fontSize: Math.max(12, size * 0.34),
                fontWeight: 700,
            }}
        >
            {user.avatar_url ? (
                <img src={user.avatar_url} alt={`${user.full_name} profile`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
        </div>
    );
}
