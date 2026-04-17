import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveBasePath(): string {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!process.env.GITHUB_ACTIONS || !repository) {
    return '/';
  }

  const repositoryName = repository.split('/')[1];
  return repositoryName ? `/${repositoryName}/` : '/';
}

// https://vite.dev/config/
export default defineConfig({
  base: resolveBasePath(),
  plugins: [react()],
});
