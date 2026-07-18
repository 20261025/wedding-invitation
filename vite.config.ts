import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildEnvironment =
  (globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> }
  }).process?.env ?? {}
const repositoryName = buildEnvironment.GITHUB_REPOSITORY?.split('/').at(-1)
const githubPagesBase =
  buildEnvironment.GITHUB_ACTIONS === 'true' && repositoryName
    ? '/' + repositoryName + '/'
    : '/'

export default defineConfig({
  base: githubPagesBase,
  plugins: [react()],
})
