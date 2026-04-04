import type { Metadata } from 'next';
import ShowcaseClient from './ShowcaseClient';

export const metadata: Metadata = {
  title: 'Component Showcase | Learnity',
  description: 'Visual inventory of all UI components used across the platform.',
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
