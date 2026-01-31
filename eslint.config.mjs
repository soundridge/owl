import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  react: true,
  markdown: false,
  ignores: [
    '**/node_modules',
    '**/dist',
    '**/out',
    '**/src/renderer/src/components/ui',
  ],
})
