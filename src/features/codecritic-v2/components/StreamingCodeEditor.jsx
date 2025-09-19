import PropTypes from 'prop-types';
import { CodeEditor } from '../../../components';
import './StreamingCodeEditor.css';

/**
 * Enhanced Code Editor for CodeCritic 2.0 with streaming support
 */
const StreamingCodeEditor = ({
  value,
  onChange,
  placeholder = "Paste your code here for real-time AI analysis...",
  language = "javascript",
  disabled = false,
  isStreaming = false,
  streamProgress = 0,
  sessionId = null,
  className = '',
}) => {
  return (
    <div className={`streaming-code-editor ${className}`}>
      <div className="streaming-code-editor__content">
        <CodeEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          language={language}
          disabled={disabled || isStreaming}
        />
      </div>
    </div>
  );
};

StreamingCodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  language: PropTypes.string,
  disabled: PropTypes.bool,
  isStreaming: PropTypes.bool,
  streamProgress: PropTypes.number,
  sessionId: PropTypes.string,
  className: PropTypes.string,
};

export default StreamingCodeEditor;