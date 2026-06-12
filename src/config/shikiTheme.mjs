export const monoTheme = {
  name: 'mono-dark',
  type: 'dark',
  colors: {
    'editor.background': '#080808',
    'editor.foreground': '#ffffff',
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
        foreground: '#ffffff',
        fontStyle: 'bold',
      },
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.method'],
      settings: {
        foreground: '#ffffff',
      },
    },
    {
      scope: ['variable', 'support.variable', 'entity.name.variable', 'parameter', 'variable.parameter'],
      settings: {
        foreground: '#e5e5e5',
      },
    },
    {
      scope: ['entity.name.type', 'support.type', 'storage.type.c', 'storage.type.cpp'],
      settings: {
        foreground: '#e5e5e5',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['constant', 'constant.numeric', 'constant.language', 'support.constant', 'constant.character'],
      settings: {
        foreground: '#a3a3a3',
      },
    },
    {
      scope: ['string', 'string.template', 'punctuation.definition.string'],
      settings: {
        foreground: '#737373',
      },
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#404040',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['punctuation', 'meta.brace', 'keyword.operator', 'storage.modifier.pointer'],
      settings: {
        foreground: '#a3a3a3',
      },
    },
  ],
};
