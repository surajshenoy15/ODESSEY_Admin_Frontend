export const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  REGISTRATION_ADMIN: 'Registration Admin',
  ATTENDANCE_ADMIN: 'Attendance Admin',
  FIXTURE_ADMIN: 'Fixture Admin',
  CERTIFICATE_ADMIN: 'Certificate Admin',
}

export function hasRole(currentRole, ...allowedRoles) {
  return currentRole === 'SUPER_ADMIN' || allowedRoles.includes(currentRole)
}
