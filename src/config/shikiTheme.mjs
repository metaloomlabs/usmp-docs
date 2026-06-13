export const monoTheme = {
  name: 'mono-dynamic',
  type: 'dark',
  colors: {
    'editor.background': 'var(--shiki-color-background)',
    'editor.foreground': 'var(--shiki-color-text)',
  },
  tokenColors: [
    {
      scope: [
        'keyword',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'meta.preprocessor',
        'punctuation.definition.preprocessor'
      ],
      settings: {
        foreground: 'var(--shiki-token-keyword)',
        fontStyle: 'bold',
      },
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.method'],
      settings: {
        foreground: 'var(--shiki-token-function)',
      },
    },
    {
      scope: ['variable', 'support.variable', 'entity.name.variable', 'parameter', 'variable.parameter'],
      settings: {
        foreground: 'var(--shiki-token-variable)',
      },
    },
    {
      scope: ['entity.name.type', 'support.type', 'storage.type.c', 'storage.type.cpp'],
      settings: {
        foreground: 'var(--shiki-token-type)',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['constant', 'constant.numeric', 'constant.language', 'support.constant', 'constant.character'],
      settings: {
        foreground: 'var(--shiki-token-constant)',
      },
    },
    {
      scope: ['string', 'string.template', 'punctuation.definition.string'],
      settings: {
        foreground: 'var(--shiki-token-string)',
      },
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: 'var(--shiki-token-comment)',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['punctuation', 'meta.brace', 'keyword.operator', 'storage.modifier.pointer'],
      settings: {
        foreground: 'var(--shiki-token-punctuation)',
      },
    },
  ],
};
