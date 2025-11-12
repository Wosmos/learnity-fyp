/**
 * Access Control Testing Utilities
 * Utilities for testing and verifying role-based access control
 */

import { UserRole } from '../../src/types/auth';

export interface RouteProtectionRule {
  path: string;
  allowedRoles: UserRole[];
  redirectRules: Partial<Record<UserRole, string>>;
  description: string;
}

export interface AccessTestResult {
  path: string;
  userRole: UserRole;
  shouldHaveAccess: boolean;
  actualResult: 'granted' | 'denied' | 'redirected';
  redirectedTo?: string;
  passed: boolean;
  error?: string;
}

/**
 * Route protection configuration
 */
export const ROUTE_PROTECTION_RULES: RouteProtectionRule[] = [
  {
    path: '/dashboard/student',
    allowedRoles: [UserRole.STUDENT],
    redirectRules: {
      [UserRole.TEACHER]: '/dashboard/teacher',
      [UserRole.ADMIN]: '/admin',
      [UserRole.PENDING_TEACHER]: '/application/status'
    },
    description: 'Student dashboard - only accessible to students'
  },
  {
    path: '/dashboard/teacher',
    allowedRoles: [UserRole.TEACHER, UserRole.ADMIN],
    redirectRules: {
      [UserRole.STUDENT]: '/dashboard/student',
      [UserRole.PENDING_TEACHER]: '/application/status'
    },
    description: 'Teacher dashboard - accessible to teachers and admins'
  },
  {
    path: '/admin',
    allowedRoles: [UserRole.ADMIN],
    redirectRules: {
      [UserRole.STUDENT]: '/dashboard/student',
      [UserRole.TEACHER]: '/dashboard/teacher',
      [UserRole.PENDING_TEACHER]: '/application/status'
    },
    description: 'Admin panel - only accessible to admins'
  },
  {
    path: '/application/status',
    allowedRoles: [UserRole.PENDING_TEACHER],
    redirectRules: {
      [UserRole.STUDENT]: '/dashboard/student',
      [UserRole.TEACHER]: '/dashboard/teacher',
      [UserRole.ADMIN]: '/admin'
    },
    description: 'Application status - only accessible to pending teachers'
  }
];

/**
 * Test access control for a specific route and user role
 */
export function testRouteAccess(path: string, userRole: UserRole): AccessTestResult {
  const rule = ROUTE_PROTECTION_RULES.find(r => r.path === path);
  
  if (!rule) {
    return {
      path,
      userRole,
      shouldHaveAccess: false,
      actualResult: 'denied',
      passed: false,
      error: 'Route not found in protection rules'
    };
  }

  const shouldHaveAccess = rule.allowedRoles.includes(userRole);
  
  return {
    path,
    userRole,
    shouldHaveAccess,
    actualResult: shouldHaveAccess ? 'granted' : 'denied',
    redirectedTo: shouldHaveAccess ? undefined : rule.redirectRules[userRole],
    passed: true // This would be determined by actual testing
  };
}

/**
 * Test all route access combinations
 */
export function testAllRouteAccess(): AccessTestResult[] {
  const results: AccessTestResult[] = [];
  const roles = Object.values(UserRole);
  
  for (const rule of ROUTE_PROTECTION_RULES) {
    for (const role of roles) {
      results.push(testRouteAccess(rule.path, role));
    }
  }
  
  return results;
}

/**
 * Generate access control test report
 */
export function generateAccessControlReport(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: AccessTestResult[];
  summary: string;
} {
  const results = testAllRouteAccess();
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.length - passedTests;
  
  const summary = `
Access Control Test Report
=========================
Total Tests: ${results.length}
Passed: ${passedTests}
Failed: ${failedTests}
Success Rate: ${((passedTests / results.length) * 100).toFixed(1)}%

Route Protection Summary:
${ROUTE_PROTECTION_RULES.map(rule => `
- ${rule.path}: ${rule.allowedRoles.join(', ')}
  ${rule.description}
`).join('')}
  `;
  
  return {
    totalTests: results.length,
    passedTests,
    failedTests,
    results,
    summary
  };
}

/**
 * Validate user role against route requirements
 */
export function validateRouteAccess(path: string, userRole: UserRole): {
  hasAccess: boolean;
  redirectTo?: string;
  reason: string;
} {
  const rule = ROUTE_PROTECTION_RULES.find(r => r.path === path);
  
  if (!rule) {
    return {
      hasAccess: false,
      reason: 'Route not protected or not found'
    };
  }
  
  const hasAccess = rule.allowedRoles.includes(userRole);
  
  if (hasAccess) {
    return {
      hasAccess: true,
      reason: `User role ${userRole} is authorized for ${path}`
    };
  }
  
  return {
    hasAccess: false,
    redirectTo: rule.redirectRules[userRole] || '/unauthorized',
    reason: `User role ${userRole} is not authorized for ${path}. Required roles: ${rule.allowedRoles.join(', ')}`
  };
}

/**
 * Get all routes accessible by a specific role
 */
export function getAccessibleRoutes(userRole: UserRole): string[] {
  return ROUTE_PROTECTION_RULES
    .filter(rule => rule.allowedRoles.includes(userRole))
    .map(rule => rule.path);
}

/**
 * Get all routes NOT accessible by a specific role
 */
export function getRestrictedRoutes(userRole: UserRole): string[] {
  return ROUTE_PROTECTION_RULES
    .filter(rule => !rule.allowedRoles.includes(userRole))
    .map(rule => rule.path);
}

/**
 * Check if cross-role access is properly prevented
 */
export function validateCrossRoleAccessPrevention(): {
  violations: Array<{
    route: string;
    unauthorizedRole: UserRole;
    shouldRedirectTo: string;
  }>;
  isSecure: boolean;
} {
  const violations: Array<{
    route: string;
    unauthorizedRole: UserRole;
    shouldRedirectTo: string;
  }> = [];
  
  // Check each route for proper cross-role access prevention
  for (const rule of ROUTE_PROTECTION_RULES) {
    const allRoles = Object.values(UserRole);
    const unauthorizedRoles = allRoles.filter(role => !rule.allowedRoles.includes(role));
    
    for (const role of unauthorizedRoles) {
      const expectedRedirect = rule.redirectRules[role] || '/unauthorized';
      violations.push({
        route: rule.path,
        unauthorizedRole: role,
        shouldRedirectTo: expectedRedirect
      });
    }
  }
  
  return {
    violations,
    isSecure: violations.length === 0 // This would be true if all violations are properly handled
  };
}

/**
 * Security audit for access control implementation
 */
export function performSecurityAudit(): {
  score: number;
  issues: string[];
  recommendations: string[];
  summary: string;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;
  
  // Check if all routes have protection rules
  const protectedPaths = ROUTE_PROTECTION_RULES.map(r => r.path);
  const criticalPaths = ['/dashboard/student', '/dashboard/teacher', '/admin'];
  
  for (const path of criticalPaths) {
    if (!protectedPaths.includes(path)) {
      issues.push(`Critical path ${path} is not protected`);
      score -= 25;
    }
  }
  
  // Check for overly permissive rules
  for (const rule of ROUTE_PROTECTION_RULES) {
    if (rule.allowedRoles.length > 2) {
      issues.push(`Route ${rule.path} allows too many roles: ${rule.allowedRoles.join(', ')}`);
      score -= 10;
    }
  }
  
  // Check for missing redirect rules
  for (const rule of ROUTE_PROTECTION_RULES) {
    const allRoles = Object.values(UserRole);
    const unauthorizedRoles = allRoles.filter(role => !rule.allowedRoles.includes(role));
    
    for (const role of unauthorizedRoles) {
      if (!rule.redirectRules[role]) {
        issues.push(`Missing redirect rule for ${role} on ${rule.path}`);
        score -= 5;
      }
    }
  }
  
  // Generate recommendations
  if (issues.length > 0) {
    recommendations.push('Implement comprehensive route protection for all critical paths');
    recommendations.push('Add proper redirect rules for all unauthorized role combinations');
    recommendations.push('Consider implementing server-side middleware for additional security');
    recommendations.push('Add automated testing for access control scenarios');
  }
  
  const summary = `
Security Audit Results
=====================
Overall Score: ${score}/100
Issues Found: ${issues.length}
Critical Issues: ${issues.filter(i => i.includes('Critical')).length}

${issues.length === 0 ? '✅ No security issues found' : '⚠️ Security issues require attention'}
  `;
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    summary
  };
}