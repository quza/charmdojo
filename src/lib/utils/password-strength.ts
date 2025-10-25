export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string;
  color: string;
}

/**
 * Calculate password strength based on various criteria
 * @param password - Password to evaluate
 * @returns Password strength information
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else if (score < 4) {
    feedback.push('Add special characters for extra strength');
  }

  // Determine level
  let level: PasswordStrength['level'];
  let color: string;
  let message: string;

  if (score <= 1) {
    level = 'weak';
    color = '#ef4444'; // red
    message = 'Weak password';
  } else if (score === 2) {
    level = 'fair';
    color = '#f59e0b'; // amber
    message = 'Fair password';
  } else if (score === 3) {
    level = 'good';
    color = '#10b981'; // green
    message = 'Good password';
  } else {
    level = 'strong';
    color = '#10b981'; // green
    message = 'Strong password';
  }

  return {
    score,
    level,
    feedback: feedback.length > 0 ? feedback.join('. ') : message,
    color,
  };
}

/**
 * Get progress percentage for password strength meter
 */
export function getPasswordStrengthProgress(score: number): number {
  return (score / 4) * 100;
}

