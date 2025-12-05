import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('preview canvas deve ser consistente visualmente', async ({ page }) => {
    await page.goto('/');

    // Espera a página carregar
    await expect(page.locator('text=G-Code Generator')).toBeVisible();

    // Navega para aba de adicionar peça
    const addPieceTab = page.locator('text=Adicionar Peça');
    if (await addPieceTab.isVisible()) {
      await addPieceTab.click();
    }

    // Adiciona peças com dimensões fixas para teste visual
    await page.fill('#pecaLargura', '100');
    await page.fill('#pecaAltura', '200');
    await page.click('[data-testid="btn-adicionar-peca"]');
    await expect(page.locator('text=Lista de Peças (1)')).toBeVisible();

    await page.fill('#pecaLargura', '150');
    await page.fill('#pecaAltura', '150');
    await page.click('[data-testid="btn-adicionar-peca"]');
    await expect(page.locator('text=Lista de Peças (2)')).toBeVisible();

    // Espera o canvas renderizar
    await page.waitForTimeout(1000);

    // Captura screenshot do preview canvas
    const canvas = page.locator('canvas').first();
    await expect(canvas).toHaveScreenshot('preview-canvas-2-pecas.png', {
      maxDiffPixels: 100, // Permite pequenas diferenças de renderização
    });
  });

  test('página inicial deve ser consistente visualmente', async ({ page }) => {
    await page.goto('/');

    // Espera a página carregar completamente
    await expect(page.locator('text=G-Code Generator')).toBeVisible();
    await page.waitForTimeout(500);

    // Screenshot da página completa
    await expect(page).toHaveScreenshot('homepage-initial-state.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('lista de peças deve ser consistente visualmente', async ({ page }) => {
    await page.goto('/');

    // Navega para aba de adicionar peça
    const addPieceTab = page.locator('text=Adicionar Peça');
    if (await addPieceTab.isVisible()) {
      await addPieceTab.click();
    }

    // Adiciona 3 peças diferentes
    const pecas = [
      { largura: '100', altura: '200' },
      { largura: '150', altura: '150' },
      { largura: '80', altura: '300' },
    ];

    for (const peca of pecas) {
      await page.fill('#pecaLargura', peca.largura);
      await page.fill('#pecaAltura', peca.altura);
      await page.click('[data-testid="btn-adicionar-peca"]');
      await page.waitForTimeout(300);
    }

    await expect(page.locator('text=Lista de Peças (3)')).toBeVisible();

    // Screenshot da lista de peças
    const listaPecas = page.locator('text=Lista de Peças').locator('..').locator('..');
    await expect(listaPecas).toHaveScreenshot('lista-pecas-3-items.png', {
      maxDiffPixels: 100,
    });
  });

  test('dark mode deve ser consistente visualmente', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=G-Code Generator')).toBeVisible();

    // Ativa dark mode (assumindo que há um botão de toggle)
    const themeToggle = page.locator('button[aria-label*="tema"], button[aria-label*="theme"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Screenshot em dark mode
      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    }
  });
});
