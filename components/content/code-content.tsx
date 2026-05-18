'use client'

import { Sandpack } from '@codesandbox/sandpack-react'
import type { CodePlayground } from '@/lib/types'

interface CodeContentProps {
  code: CodePlayground
}

const languageToSandpackTemplate: Record<string, 'vanilla' | 'vanilla-ts' | 'react' | 'react-ts'> = {
  javascript: 'vanilla',
  typescript: 'vanilla-ts',
  html: 'vanilla',
  css: 'vanilla',
  python: 'vanilla', // Sandpack doesn't support Python, will use JS as fallback
}

export function CodeContent({ code }: CodeContentProps) {
  const template = languageToSandpackTemplate[code.language] || 'vanilla'
  
  // Determine file extension
  const getFileExtension = () => {
    switch (code.language) {
      case 'typescript': return 'ts'
      case 'javascript': return 'js'
      case 'html': return 'html'
      case 'css': return 'css'
      default: return 'js'
    }
  }

  const fileName = code.language === 'html' 
    ? '/index.html' 
    : code.language === 'css'
      ? '/styles.css'
      : `/index.${getFileExtension()}`

  // Build files object
  const files: Record<string, string> = {
    [fileName]: code.template,
  }

  // For HTML, wrap in basic structure if needed
  if (code.language === 'html' && !code.template.includes('<!DOCTYPE')) {
    files['/index.html'] = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      padding: 20px;
      background: #1a1a2e;
      color: #e0e0e0;
    }
  </style>
</head>
<body>
${code.template}
</body>
</html>`
  }

  return (
    <div className="h-full min-h-[400px] rounded-lg overflow-hidden">
      <Sandpack
        template={template}
        files={files}
        theme={{
          colors: {
            surface1: '#1a1a2e',
            surface2: '#222244',
            surface3: '#2a2a4a',
            clickable: '#6080e0',
            base: '#e0e0e0',
            disabled: '#555566',
            hover: '#7090f0',
            accent: '#50d0a0',
            error: '#e05050',
            errorSurface: '#3a2020',
          },
          syntax: {
            plain: '#e0e0e0',
            comment: { color: '#666688', fontStyle: 'italic' },
            keyword: '#c080f0',
            tag: '#50d0a0',
            punctuation: '#888899',
            definition: '#80b0ff',
            property: '#e0c060',
            static: '#80b0ff',
            string: '#50d0a0',
          },
          font: {
            body: '"Geist", system-ui, sans-serif',
            mono: '"Geist Mono", monospace',
            size: '13px',
            lineHeight: '1.6',
          },
        }}
        options={{
          showNavigator: false,
          showTabs: true,
          showLineNumbers: true,
          showInlineErrors: true,
          editorHeight: 300,
          classes: {
            'sp-wrapper': 'sandpack-wrapper',
          },
        }}
      />
      
      {code.solution && (
        <details className="mt-4">
          <summary className="text-sm text-primary cursor-pointer hover:underline">
            Show Solution
          </summary>
          <pre className="mt-2 p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs">
            <code>{code.solution}</code>
          </pre>
        </details>
      )}
    </div>
  )
}
