import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  abbreviateNumber,
  getConfidenceColor,
  getPriorityColor,
  getHealthScoreColor,
  getHealthScoreGrade,
} from '@/lib/utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(1000000)).toBe('₹10,00,000');
      expect(formatCurrency(1234.56)).toBe('₹1,235');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.123)).toBe('12.3%');
      expect(formatPercentage(1)).toBe('100.0%');
    });
  });

  describe('formatNumber', () => {
    it('should format number correctly', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('10,00,000');
    });
  });

  describe('abbreviateNumber', () => {
    it('should abbreviate number correctly', () => {
      expect(abbreviateNumber(1000)).toBe('₹1.0K');
      expect(abbreviateNumber(1000000)).toBe('₹1.0M');
      expect(abbreviateNumber(500)).toBe('₹500');
    });
  });

  describe('getHealthScoreGrade', () => {
    it('should return correct grade', () => {
      expect(getHealthScoreGrade(95)).toBe('A+');
      expect(getHealthScoreGrade(85)).toBe('A');
      expect(getHealthScoreGrade(75)).toBe('B');
      expect(getHealthScoreGrade(65)).toBe('C');
      expect(getHealthScoreGrade(55)).toBe('D');
      expect(getHealthScoreGrade(45)).toBe('F');
    });
  });

  describe('Color functions', () => {
    it('should return correct confidence color', () => {
      expect(getConfidenceColor(95)).toBe('text-green-600');
      expect(getConfidenceColor(80)).toBe('text-blue-600');
      expect(getConfidenceColor(70)).toBe('text-yellow-600');
      expect(getConfidenceColor(50)).toBe('text-red-600');
    });

    it('should return correct priority color', () => {
      expect(getPriorityColor('critical')).toBe('text-red-600');
      expect(getPriorityColor('high')).toBe('text-orange-600');
      expect(getPriorityColor('medium')).toBe('text-yellow-600');
      expect(getPriorityColor('low')).toBe('text-green-600');
    });

    it('should return correct health score color', () => {
      expect(getHealthScoreColor(85)).toBe('text-green-600');
      expect(getHealthScoreColor(65)).toBe('text-blue-600');
      expect(getHealthScoreColor(45)).toBe('text-yellow-600');
      expect(getHealthScoreColor(25)).toBe('text-red-600');
    });
  });
});
