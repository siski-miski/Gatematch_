import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, Link as LinkIcon, Undo2, Redo2 } from 'lucide-react';

type RichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
};

const TOOLBAR_ACTIONS = [
    { command: 'bold', label: 'Bold', icon: Bold },
    { command: 'italic', label: 'Italic', icon: Italic },
    { command: 'underline', label: 'Underline', icon: Underline },
    { command: 'insertUnorderedList', label: 'Bullet list', icon: List },
    { command: 'createLink', label: 'Link', icon: LinkIcon },
    { command: 'undo', label: 'Undo', icon: Undo2 },
    { command: 'redo', label: 'Redo', icon: Redo2 },
] as const;

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 260 }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        if (editor.innerHTML !== value) {
            editor.innerHTML = value;
        }
    }, [value]);

    const sync = () => {
        const editor = editorRef.current;
        if (editor) onChange(editor.innerHTML);
    };

    const exec = (command: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        if (command === 'createLink') {
            const url = window.prompt('Enter a URL');
            if (!url) return;
            document.execCommand('createLink', false, url);
        } else {
            document.execCommand(command, false);
        }
        sync();
    };

    return (
        <div className="rt-editor">
            <div className="rt-toolbar">
                {TOOLBAR_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.command}
                            type="button"
                            className="rt-toolbar-btn"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => exec(action.command)}
                            title={action.label}
                        >
                            <Icon size={14} />
                        </button>
                    );
                })}
            </div>

            <div
                ref={editorRef}
                className="rt-editor-surface"
                contentEditable
                suppressContentEditableWarning
                onInput={sync}
                onBlur={sync}
                data-placeholder={placeholder}
                style={{ minHeight }}
            />
        </div>
    );
}