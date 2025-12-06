import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CadastroPeca } from './CadastroPeca';

const meta: Meta<typeof CadastroPeca> = {
  title: 'Components/CadastroPeca',
  component: CadastroPeca,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Mock do Zustand store para Storybook
      // O componente usa useConfigStore() internamente
      return (
        <div className="w-[400px]">
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof CadastroPeca>;

// Story padrão: sem peças que não couberam
export const Default: Story = {
  args: {},
};

// Story com peças que não couberam (alerta visível)
export const ComPecasNaoCouberam: Story = {
  args: {
    pecasNaoCouberam: [
      {
        id: '1',
        largura: 100,
        altura: 200,
        tipoCorte: 'externo',
        numeroOriginal: 11,
      },
      {
        id: '2',
        largura: 150,
        altura: 150,
        tipoCorte: 'interno',
        numeroOriginal: 12,
      },
    ],
  },
};

// Story com uma única peça que não coube
export const ComUmaPecaNaoCoube: Story = {
  args: {
    pecasNaoCouberam: [
      {
        id: '1',
        largura: 300,
        altura: 400,
        tipoCorte: 'externo',
        numeroOriginal: 8,
      },
    ],
  },
};
