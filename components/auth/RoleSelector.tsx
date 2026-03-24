'use client';

import { UserRole } from '@/types';
import { useEffect } from 'react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  excludeRoles?: UserRole[]; // Allow excluding certain roles
}

const ROLE_SHORTCUTS: Record<string, UserRole> = {
  's': 'student',
  'a': 'admin',
};

export default function RoleSelector({
  selectedRole,
  onRoleChange,
  excludeRoles = [],
}: RoleSelectorProps) {
  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if user is not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const role = ROLE_SHORTCUTS[e.key.toLowerCase()];
      if (role && !excludeRoles.includes(role)) {
        onRoleChange(role);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onRoleChange, excludeRoles]);

  const roles: { value: UserRole; label: string; shortcut: string; color: string }[] = (
    [
      { value: 'student' as UserRole, label: 'Student', shortcut: 'S', color: 'bg-blue-500' },
      { value: 'admin'   as UserRole, label: 'Admin',   shortcut: 'A', color: 'bg-red-500'  },
    ] satisfies { value: UserRole; label: string; shortcut: string; color: string }[]
  ).filter(role => !excludeRoles.includes(role.value));

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Role
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onRoleChange(role.value)}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${
                selectedRole === role.value
                  ? `${role.color} border-transparent text-white shadow-lg scale-105`
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="font-semibold">{role.label}</span>
              <span className="text-xs opacity-75">
                Press <kbd className="px-1.5 py-0.5 bg-black bg-opacity-20 rounded">
                  {role.shortcut}
                </kbd>
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center">
        💡 Use keyboard shortcuts to quickly select roles
      </p>
    </div>
  );
}
