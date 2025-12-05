import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CadastroPeca } from './CadastroPeca';
import type { Peca } from '@/types';

const meta: Meta<typeof CadastroPeca> = {
  title: 'Components/CadastroPeca',
  component: CadastroPeca,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CadastroPeca>;

export const Default: Story = {
  args: {
    onAdicionar: (peca: Peca) => {
      alert(`Peça adicionada: ${peca.largura}×${peca.altura}mm`);
    },
  },
};

export const WithCallback: Story = {
  args: {
    onAdicionar: () => {},
  },
};
