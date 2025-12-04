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

    // Clica no botão de adicionar
    await page.click('button:has-text("Adicionar Peça")');

    // Verifica se a peça aparece na lista
    // A peça deve mostrar dimensões 100 x 200
    await expect(page.locator('text=100 x 200')).toBeVisible({ timeout: 5000 });

    // Verifica que não há mensagens de erro
    await expect(page.locator('.bg-destructive')).not.toBeVisible();
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
    await page.click('button:has-text("Adicionar Peça")');
    await expect(page.locator('text=100 x 200')).toBeVisible();

    // Adiciona segunda peça
    await page.fill('#pecaLargura', '150');
    await page.fill('#pecaAltura', '250');
    await page.click('button:has-text("Adicionar Peça")');
    await expect(page.locator('text=150 x 250')).toBeVisible();

    // Verifica que ambas peças estão visíveis
    await expect(page.locator('text=100 x 200')).toBeVisible();
    await expect(page.locator('text=150 x 250')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/');

    // Navega para aba de adicionar peça
    const addPieceTab = page.locator('text=Adicionar Peça');
    if (await addPieceTab.isVisible()) {
      await addPieceTab.click();
    }

    // Tenta adicionar peça sem preencher campos
    await page.click('button:has-text("Adicionar Peça")');

    // Deve mostrar mensagem de erro
    await expect(page.locator('text=/Informe.*válid/i')).toBeVisible({ timeout: 3000 });
  });
});
