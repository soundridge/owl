import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  react: true,
  ignores: ['**/node_modules', '**/dist', '**/out']
})
