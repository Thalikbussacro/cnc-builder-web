import { test, expect } from '@playwright/test';

test.describe('G-code Generation Flow', () => {
  test('deve adicionar peça e visualizar na lista', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');

    // Espera a página carregar
    await expect(page.locator('text=G-Code Generator')).toBeVisible();

    // Navega para aba de adicionar peça (se não estiver visível)
    const addPieceTab = page.locator('text=Adicionar Peça');
    if (await addPieceTab.isVisible()) {
      await addPieceTab.click();
    }

    // Preenche os dados da peça
    await page.fill('#pecaLargura', '100');
    await page.fill('#pecaAltura', '200');

    // Clica no botão de adicionar usando data-testid
    await page.click('[data-testid="btn-adicionar-peca"]');

    // Verifica que a lista mostra 1 peça
    await expect(page.locator('text=Lista de Peças (1)')).toBeVisible({ timeout: 5000 });

    // Verifica se a peça aparece na lista (formato: 100×200mm com caractere ×)
    await expect(page.locator('.font-mono').filter({ hasText: '100×200mm' })).toBeVisible();
  });

  test('deve adicionar múltiplas peças', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=G-Code Generator')).toBeVisible();

    // Navega para aba de adicionar peça
    const addPieceTab = page.locator('text=Adicionar Peça');
    if (await addPieceTab.isVisible()) {
      await addPieceTab.click();
    }

    // Adiciona primeira peça
    await page.fill('#pecaLargura', '100');
    await page.fill('#pecaAltura', '200');
    await page.click('[data-testid="btn-adicionar-peca"]');
    await expect(page.locator('text=Lista de Peças (1)')).toBeVisible();

    // Adiciona segunda peça
    await page.fill('#pecaLargura', '150');
    await page.fill('#pecaAltura', '250');
    await page.click('[data-testid="btn-adicionar-peca"]');
    await expect(page.locator('text=Lista de Peças (2)')).toBeVisible();

    // Verifica que ambas peças estão visíveis na lista
    await expect(page.locator('.font-mono').filter({ hasText: '100×200mm' })).toBeVisible();
    await expect(page.locator('.font-mono').filter({ hasText: '150×250mm' })).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/');

    // Navega para aba de adicionar peça
    const addPieceTab = page.locator('text=Adicionar Peça');
    if (await addPieceTab.isVisible()) {
      await addPieceTab.click();
    }

    // Tenta adicionar peça sem preencher campos
    await page.click('[data-testid="btn-adicionar-peca"]');

    // Deve mostrar mensagem de erro usando data-testid
    await expect(page.getByTestId('erro-cadastro')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('erro-cadastro')).toContainText('Informe');
  });
});
