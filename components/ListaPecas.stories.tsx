import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ListaPecas } from './ListaPecas';
import type { Peca } from '@/types';

const meta: Meta<typeof ListaPecas> = {
  title: 'Components/ListaPecas',
  component: ListaPecas,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListaPecas>;

const pecasMock: Peca[] = [
  {
    id: '1',
    largura: 100,
    altura: 200,
    tipoCorte: 'externo',
    nome: 'Peça A',
  },
  {
    id: '2',
    largura: 150,
    altura: 150,
    tipoCorte: 'interno',
    nome: 'Peça B',
  },
  {
    id: '3',
    largura: 80,
    altura: 300,
    tipoCorte: 'na-linha',
    nome: 'Peça C',
  },
];

export const Empty: Story = {
  args: {
    pecas: [],
  },
};

export const SinglePiece: Story = {
  args: {
    pecas: [pecasMock[0]],
  },
};

export const MultiplePieces: Story = {
  args: {
    pecas: pecasMock,
  },
};

export const WithRemoveCallback: Story = {
  args: {
    pecas: pecasMock,
    onRemover: (id: string) => {
      alert(`Removendo peça: ${id}`);
    },
  },
};

export const WithToggleCallback: Story = {
  args: {
    pecas: pecasMock.map((p, i) => ({ ...p, ignorada: i === 1 })),
    onRemover: (id: string) => alert(`Removendo: ${id}`),
    onToggleIgnorar: (id: string) => alert(`Toggle ignorar: ${id}`),
  },
};

export const ManyPieces: Story = {
  args: {
    pecas: Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      largura: 100 + i * 10,
      altura: 200 - i * 5,
      tipoCorte: ['externo', 'interno', 'na-linha'][i % 3] as 'externo' | 'interno' | 'na-linha',
      nome: `Peça ${i + 1}`,
    })),
    onRemover: (id: string) => alert(`Removendo: ${id}`),
    onToggleIgnorar: (id: string) => alert(`Toggle: ${id}`),
  },
};
