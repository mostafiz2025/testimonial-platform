import { randomBytes } from 'crypto';

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'space';
}

export function randomSuffix(): string {
  return randomBytes(2).toString('hex');
}
