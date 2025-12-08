import React, { useState } from 'react';

export interface MessageProps {
    role: string | number;
    content: string;
}

export const Message: React.FC<MessageProps> = ({ role, content }) => {
    const roleLabel = typeof role === 'number'
        ? (role === 3 ? 'System' : role === 1 ? 'User' : role === 2 ? 'Assistant' : 'Unknown')
        : role;

    const [expanded, setExpanded] = useState(false);

    const PREVIEW_WORDS = 50;
    const words = content.trim().length === 0 ? [] : content.trim().split(/\s+/);
    const shouldTruncate = words.length > PREVIEW_WORDS;
    const previewText = shouldTruncate ? words.slice(0, PREVIEW_WORDS).join(' ') : content;

    return (
        <div className="message">
            <span className="role">{roleLabel}:</span>&nbsp;
            {shouldTruncate && (
                <button
                    className="preview-toggle"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((s) => !s)}
                    title={expanded ? 'Collapse' : 'Expand'}
                    style={{
                        marginRight: 8,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: 'inherit',
                        fontSize: '0.9em',
                        verticalAlign: 'middle',
                    }}
                >
                    {expanded ? '▼' : '▶'}
                </button>
            )}

            <span className="content">
                {shouldTruncate ? (expanded ? content : previewText + '...') : content}
            </span>
        </div>
    );
};

export default Message;
