import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should be defined', () => {
    expect(useAuth).toBeDefined();
  });
});