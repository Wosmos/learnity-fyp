# CertificatePage Component

## Overview

The `CertificatePage` component displays a professional certificate of completion with download and share functionality.

## Requirements Covered

- **10.2**: Certificate display with student name, course title, completion date, and unique certificate ID
- **10.3**: Download PDF button functionality
- **10.5**: Share options (social media, copy link, native share)

## Features

### Certificate Display

- Professional certificate layout with decorative elements
- Student name prominently displayed
- Course title and description
- Difficulty level badge
- Issue date
- Unique certificate ID with copy functionality
- Verification note

### Download Functionality

- Download certificate as PDF
- Automatic filename generation
- Loading state during download
- Error handling with toast notifications

### Share Options

- Copy verification link
- Share on Twitter
- Share on LinkedIn
- Share on Facebook
- Native share API support (mobile)
- Copy certificate ID

## Usage

### Basic Usage

```tsx
import { CertificatePage } from '@/components/courses/CertificatePage';

function MyCertificatePage() {
  const handleDownload = async () => {
    // Download logic
  };

  return (
    <CertificatePage
      certificateId='CERT-12345678-ABCD'
      studentName='John Doe'
      courseTitle='Introduction to React'
      courseDescription='Learn the fundamentals of React'
      difficulty='BEGINNER'
      issuedAt={new Date()}
      onDownload={handleDownload}
      isDownloading={false}
    />
  );
}
```

### With Client Wrapper (Recommended)

For automatic download functionality, use the `CertificatePageClient` wrapper:

```tsx
// In your page component
import { CertificatePageClient } from './CertificatePageClient';

export default function CertificateViewPage() {
  return (
    <CertificatePageClient
      certificateId='CERT-12345678-ABCD'
      studentName='John Doe'
      courseTitle='Introduction to React'
      courseDescription='Learn the fundamentals of React'
      difficulty='BEGINNER'
      issuedAt={new Date()}
    />
  );
}
```

## Props

### CertificatePageProps

| Prop                | Type                                         | Required | Description                   |
| ------------------- | -------------------------------------------- | -------- | ----------------------------- |
| `certificateId`     | `string`                                     | Yes      | Unique certificate identifier |
| `studentName`       | `string`                                     | Yes      | Full name of the student      |
| `courseTitle`       | `string`                                     | Yes      | Title of the completed course |
| `courseDescription` | `string`                                     | No       | Course description            |
| `difficulty`        | `"BEGINNER" \| "INTERMEDIATE" \| "ADVANCED"` | Yes      | Course difficulty level       |
| `issuedAt`          | `Date`                                       | Yes      | Certificate issue date        |
| `className`         | `string`                                     | No       | Additional CSS classes        |
| `onDownload`        | `() => void`                                 | No       | Download button click handler |
| `isDownloading`     | `boolean`                                    | No       | Download loading state        |

## API Integration

The component integrates with the following API endpoints:

- `GET /api/certificates/[certificateId]` - Fetch certificate details
- `GET /api/certificates/[certificateId]/download` - Download PDF

## Styling

The component uses:

- Tailwind CSS for styling
- shadcn/ui components (Card, Button, Badge, etc.)
- Lucide React icons
- Responsive design (mobile-first)
- Dark mode support

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Native share API (where supported)

## Example Page

See `/app/certificates/[certificateId]/page.tsx` for a complete implementation example.

## Related Components

- `CertificatePageClient` - Client wrapper with download functionality
- `Card` - Base card component
- `Button` - Button component
- `Badge` - Badge component for difficulty level
- `DropdownMenu` - Share options menu

## Notes

- The certificate verification URL is automatically generated based on the current domain
- Social media sharing opens in a new window
- PDF download uses the browser's native download functionality
- Toast notifications require the `useToast` hook from shadcn/ui
