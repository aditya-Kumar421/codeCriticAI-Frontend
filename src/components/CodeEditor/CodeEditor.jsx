import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Editor from 'react-simple-code-editor';
import prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import './CodeEditor.css';

/**
 * Code Editor component with syntax highlighting
 */
const CodeEditor = ({
  value,
  onChange,
  placeholder = 'Paste your code here...',
  language = 'javascript',
  disabled = false,
  className = '',
}) => {
  // Remove prism.highlightAll() to avoid global re-highlighting
  const highlight = (code) => {
    const lang = prism.languages[language] || prism.languages.javascript;
    return prism.highlight(code, lang, language);
  };

  return (
    <div className={`code-editor ${className}`}>
      <Editor
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        highlight={highlight}
        disabled={disabled}
        padding={16}
        style={{
          fontFamily: '"Fira Code", "Fira Mono", "Consolas", monospace',
          fontSize: '15px',
          lineHeight: '1.5',
          outline: 'none',
        }}
        textareaProps={{
          style: {
            outline: 'none',
          },
        }}
      />
    </div>
  );
};

CodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  language: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default CodeEditor;