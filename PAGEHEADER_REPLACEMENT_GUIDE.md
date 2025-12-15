# PageHeader Component - Replacement Guide

## ✅ Component Created

**Location:** `/src/components/layout/PageHeader.tsx`

The reusable PageHeader component accepts the following props:

```typescript
interface PageHeaderProps {
  title: string;                    // Main page title
  subtitle?: string;                // Optional subtitle/description
  icon?: LucideIcon;               // Optional icon from lucide-react
  iconGradient?: {                 // Optional custom gradient colors
    from: string;
    to: string;
  };
  actions?: ReactNode;             // Optional action buttons/elements
  sticky?: boolean;                // Make header sticky
  className?: string;              // Additional CSS classes
}
```

## ✅ Already Replaced

1. **`/src/app/dashboard/teacher/page.tsx`** - Teacher Dashboard ✓

## 📋 Files That Need Replacement

### Teacher Dashboard Pages

2. **`/src/app/dashboard/teacher/courses/page.tsx`** (Line 268-290)
   ```tsx
   // Replace with:
   import { PageHeader } from '@/components/layout/PageHeader';
   
   <PageHeader
     title="My Courses"
     subtitle="Manage and track your course content"
     icon={BookOpen}
     actions={
       <Link href="/dashboard/teacher/courses/new">
         <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
           <Plus className="h-4 w-4" />
           Create Course
         </Button>
       </Link>
     }
   />
   ```

3. **`/src/app/dashboard/teacher/sessions/page.tsx`** (Line 30-55)
   ```tsx
   <PageHeader
     title="Live Sessions"
     subtitle="Connect with your students in real-time"
     icon={Video}
     iconGradient={{ from: 'purple-600', to: 'purple-700' }}
   />
   ```

4. **`/src/app/dashboard/teacher/courses/[courseId]/analytics/page.tsx`** (Line 222+)
   ```tsx
   <PageHeader
     title="Course Analytics"
     subtitle={`Analytics for ${courseName}`}
     icon={BarChart3}
     iconGradient={{ from: 'indigo-600', to: 'indigo-700' }}
   />
   ```

5. **`/src/app/dashboard/teacher/courses/[courseId]/students/page.tsx`** (Line 299+)
   ```tsx
   <PageHeader
     title="Enrolled Students"
     subtitle={`Students enrolled in ${courseName}`}
     icon={Users}
     iconGradient={{ from: 'green-600', to: 'green-700' }}
   />
   ```

6. **`/src/components/course-builder/CourseBuilderPage.tsx`** (Line 92+)
   ```tsx
   <PageHeader
     title="Course Builder"
     subtitle="Create and manage your course content"
     icon={BookOpen}
     sticky={true}  // This one needs sticky header
     actions={
       // Add save/publish buttons here
     }
   />
   ```

## 🔍 Search Pattern

To find all instances, search for:
```
bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200
```

## 📝 Replacement Steps

For each file:

1. **Add import** at the top:
   ```tsx
   import { PageHeader } from '@/components/layout/PageHeader';
   ```

2. **Find the header block** (usually looks like):
   ```tsx
   <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
     <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
       <div className="flex justify-between items-center py-6">
         {/* ... content ... */}
       </div>
     </div>
   </header>
   ```

3. **Replace with PageHeader component**:
   ```tsx
   <PageHeader
     title="Your Title"
     subtitle="Your subtitle"
     icon={YourIcon}
     iconGradient={{ from: 'blue-600', to: 'blue-700' }}
     actions={/* Your action buttons */}
   />
   ```

## 🎨 Icon Gradient Colors

Common gradient combinations:
- **Blue** (default): `{ from: 'blue-600', to: 'blue-700' }`
- **Purple**: `{ from: 'purple-600', to: 'purple-700' }`
- **Green**: `{ from: 'green-600', to: 'green-700' }`
- **Indigo**: `{ from: 'indigo-600', to: 'indigo-700' }`
- **Emerald**: `{ from: 'emerald-600', to: 'emerald-700' }`

## ✨ Benefits

1. **Consistency**: All headers look and behave the same
2. **Maintainability**: Change header style in one place
3. **Type Safety**: TypeScript props ensure correct usage
4. **Flexibility**: Easy to customize per page
5. **Less Code**: ~30 lines reduced to ~10 lines per page

## 🚀 Next Steps

1. Replace headers in remaining files (listed above)
2. Test each page to ensure proper rendering
3. Remove old header code
4. Consider adding more props if needed (e.g., breadcrumbs, tabs)
