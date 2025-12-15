#!/bin/bash

# Loading States Audit Script
# Identifies buttons and async operations that may need loading states

echo "🔍 Auditing Loading States in Learnity App"
echo "=========================================="
echo ""

# Find all Button components without loading states
echo "📋 Buttons without loading states:"
echo "-----------------------------------"
grep -r "onClick.*async\|onClick.*=.*{" learnity-app/src/components --include="*.tsx" | \
  grep -v "isLoading\|LoadingButton\|AsyncButton" | \
  wc -l | \
  xargs -I {} echo "Found {} potential buttons needing loading states"
echo ""

# Find form submissions
echo "📝 Form submissions:"
echo "-------------------"
grep -r "onSubmit\|handleSubmit" learnity-app/src/components --include="*.tsx" | wc -l | \
  xargs -I {} echo "Found {} form submissions"
echo ""

# Find fetch/API calls
echo "🌐 API calls:"
echo "-------------"
grep -r "fetch(\|api\.\(get\|post\|put\|delete\)" learnity-app/src/components --include="*.tsx" | wc -l | \
  xargs -I {} echo "Found {} API calls"
echo ""

# Find components already using loading states
echo "✅ Components with loading states:"
echo "----------------------------------"
grep -r "isLoading\|useState.*loading\|LoadingButton" learnity-app/src/components --include="*.tsx" | \
  cut -d: -f1 | sort -u | wc -l | \
  xargs -I {} echo "Found {} components with loading states"
echo ""

# Priority files to update
echo "🎯 High Priority Files to Update:"
echo "---------------------------------"
echo "Auth Components:"
find learnity-app/src/components/auth -name "*.tsx" -type f | head -10
echo ""
echo "Course Components:"
find learnity-app/src/components/courses -name "*.tsx" -type f | head -10
echo ""
echo "Profile Components:"
find learnity-app/src/components/profile -name "*.tsx" -type f | head -10
echo ""

echo "✨ Audit Complete!"
echo ""
echo "Next Steps:"
echo "1. Review the LOADING_STATES_IMPLEMENTATION_GUIDE.md"
echo "2. Update high-priority components first"
echo "3. Test each component after updating"
echo "4. Use LoadingButton or AsyncButton for new components"
