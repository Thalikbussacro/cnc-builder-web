import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('deve atrasar valor por 300ms', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Ainda não mudou

    await waitFor(() => expect(result.current).toBe('updated'), {
      timeout: 400,
    });
  });

  it('deve usar delay padrão de 300ms', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 100 } }
    );

    expect(result.current).toBe(100);

    rerender({ value: 200 });
    expect(result.current).toBe(100);

    await waitFor(() => expect(result.current).toBe(200), {
      timeout: 400,
    });
  });

  it('deve cancelar timer anterior quando valor muda rapidamente', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBe('first');

    // Muda rápido múltiplas vezes
    rerender({ value: 'second' });
    rerender({ value: 'third' });
    rerender({ value: 'final' });

    // Deve pular valores intermediários
    expect(result.current).toBe('first');

    await waitFor(() => expect(result.current).toBe('final'), {
      timeout: 400,
    });
  });
});
