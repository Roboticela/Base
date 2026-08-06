export type PasswordRequirement = {
  id: string
  label: string
  met: boolean
}

export type PasswordStrengthResult = {
  score: number
  label: 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong'
  requirements: PasswordRequirement[]
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const requirements: PasswordRequirement[] = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', met: /[0-9]/.test(password) },
    {
      id: 'special',
      label: 'One special character',
      met: /[^a-zA-Z0-9]/.test(password),
    },
  ]

  const metCount = requirements.filter((requirement) => requirement.met).length
  const score = password.length === 0 ? 0 : metCount

  const labels: PasswordStrengthResult['label'][] = [
    'Very weak',
    'Very weak',
    'Weak',
    'Fair',
    'Strong',
    'Very strong',
  ]

  return {
    score,
    label: labels[score] ?? 'Very weak',
    requirements,
  }
}
