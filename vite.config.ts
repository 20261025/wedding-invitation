import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { invitation } from './src/data/invitation'

const buildEnvironment =
  (globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> }
  }).process?.env ?? {}
const repositoryName = buildEnvironment.GITHUB_REPOSITORY?.split('/').at(-1)
const githubPagesBase =
  buildEnvironment.GITHUB_ACTIONS === 'true' && repositoryName
    ? '/' + repositoryName + '/'
    : '/'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return entities[character]
  })
}

const socialUrl = invitation.social.siteUrl
const socialImageUrl = socialUrl.replace(/\/$/, '') + '/' + invitation.social.image.replace(/^\//, '')
const socialMeta = {
  '%INVITATION_SITE_NAME%': invitation.siteTitle,
  '%INVITATION_SOCIAL_TITLE%': invitation.social.title,
  '%INVITATION_SOCIAL_DESCRIPTION%': invitation.social.description,
  '%INVITATION_SOCIAL_URL%': socialUrl,
  '%INVITATION_SOCIAL_IMAGE%': socialImageUrl,
  '%INVITATION_SOCIAL_IMAGE_ALT%': invitation.social.imageAlt,
}

export default defineConfig({
  base: githubPagesBase,
  plugins: [
    react(),
    {
      name: 'invitation-social-meta',
      transformIndexHtml(html) {
        return Object.entries(socialMeta).reduce(
          (result, [placeholder, value]) => result.replaceAll(placeholder, escapeHtml(value)),
          html,
        )
      },
    },
  ],
})
