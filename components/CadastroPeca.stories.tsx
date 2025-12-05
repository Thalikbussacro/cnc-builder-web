import type { Meta, StoryObj } from '@storybook/react';
import { CadastroPeca } from './CadastroPeca';

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
    onAdicionar: (peca) => {
      console.log('Peça adicionada:', peca);
      alert(`Peça adicionada: ${peca.largura}×${peca.altura}mm`);
    },
  },
};

export const WithCallback: Story = {
  args: {
    onAdicionar: (peca) => {
      console.log('Nova peça:', peca);
    },
  },
};
