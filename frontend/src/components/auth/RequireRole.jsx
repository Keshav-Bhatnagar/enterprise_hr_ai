import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import { Button } from '../primitives';

export function RequireRole({ userRole, allowedRoles = [], children, onSwitchRole, defaultRoute }) {
  const normalizedUserRole = (userRole || 'EMPLOYEE').toUpperCase().replace('ROLE_', '');
  const hasAccess = allowedRoles.some(
    (role) => role.toUpperCase().replace('ROLE_', '') === normalizedUserRole
  );

  if (hasAccess) {
    return children;
  }

  // 403 No Access Page
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="p-4 rounded-full bg-status-danger-bg text-status-danger mb-4 border border-status-danger-border">
        <ShieldAlert className="size-8" />
      </div>

      <h2 className="text-xl font-bold text-text-primary tracking-tight">Access Restricted (403)</h2>
      <p className="mt-2 text-sm text-text-secondary leading-relaxed">
        Your active session role (<strong className="font-mono text-text-primary">{normalizedUserRole}</strong>) is not authorized to inspect this operational workspace.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
        {defaultRoute && (
          <Link to={defaultRoute} className="w-full">
            <Button variant="primary" className="w-full" leftIcon={ArrowLeft}>
              Return to My Workspace
            </Button>
          </Link>
        )}

        {onSwitchRole && (
          <Button
            variant="outline"
            className="w-full"
            leftIcon={UserCheck}
            onClick={() => onSwitchRole(allowedRoles[0])}
          >
            Switch to {allowedRoles[0]} View
          </Button>
        )}
      </div>
    </div>
  );
}

export default RequireRole;
