/**
 * Conteúdo explicativo para os parâmetros técnicos da CNC
 * Baseado em valores padrões reais para fresadoras CNC
 */

export const parametrosInfo = {
  // Configurações de Corte
  profundidade: {
    title: "Profundidade de Corte (Depth)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> A profundidade total que a fresa irá penetrar na madeira para cortá-la completamente.
        </div>
        <div>
          <strong>Valores para madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF 6mm: cortar a 6-6.5mm</li>
            <li>MDF 15mm: cortar a 15-15.5mm</li>
            <li>Compensado 9mm: cortar a 9-9.5mm</li>
            <li>Madeira maciça: espessura + 0.5mm para garantir corte completo</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Dica prática:</strong> Sempre adicione 0.5mm a mais que a espessura real da madeira para garantir que o corte seja completo e não deixe fibras conectadas.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>Atenção:</strong> Se cortar muito fundo (mais de 2mm além da espessura), pode danificar a mesa de sacrifício da CNC.
        </div>
      </>
    ),
  },

  espacamento: {
    title: "Espaçamento entre Peças (Spacing/Clearance)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Distância mínima entre peças adjacentes na chapa, garantindo segurança no corte.
        </div>
        <div>
          <strong>Valores típicos:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Mínimo recomendado: 5-10mm</li>
            <li>Padrão seguro: 20-50mm</li>
            <li>Peças delicadas: 50-100mm</li>
          </ul>
        </div>
        <div>
          <strong>Quando aumentar:</strong> Peças pequenas/delicadas, evitar vibrações, facilitar remoção manual.
        </div>
        <div>
          <strong>Quando diminuir:</strong> Aproveitar melhor o material (menor desperdício), peças grandes e estáveis.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>Atenção:</strong> Espaçamento insuficiente pode causar deslocamento de peças durante o corte.
        </div>
      </>
    ),
  },

  profundidadePorPassada: {
    title: "Profundidade por Passada (Depth per Pass)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Quanto a fresa desce em cada passada ao cortar madeira (múltiplas passadas até atingir profundidade total).
        </div>
        <div>
          <strong>Valores para madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF: 3-5mm por passada (fresa 6mm)</li>
            <li>Compensado: 3-4mm por passada</li>
            <li>Madeira macia: 4-6mm por passada</li>
            <li>Madeira dura: 2-3mm por passada</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Exemplo prático:</strong> Para cortar MDF 15mm com fresa 6mm usando 4mm por passada, a máquina fará 4 passadas (4mm + 4mm + 4mm + 3mm = 15mm total).
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>Atenção:</strong> Passadas muito profundas (mais que o diâmetro da fresa) causam vibração excessiva e podem quebrar a fresa.
        </div>
      </>
    ),
  },

  feedrate: {
    title: "Velocidade de Avanço (Feedrate)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Velocidade lateral da fresa durante o corte de madeira, medida em mm/min.
        </div>
        <div>
          <strong>Valores para madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Pinus/madeira macia: 2000-3000 mm/min</li>
            <li>MDF: 1500-2500 mm/min</li>
            <li>Compensado: 1500-2500 mm/min</li>
            <li>Madeira dura (carvalho, ipê): 1000-1800 mm/min</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Sinais práticos:</strong>
          <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
            <li><strong>Aumentar feedrate:</strong> Motor do eixo XY soa com facilidade, acabamento bom, sem marcas de queimado</li>
            <li><strong>Diminuir feedrate:</strong> Motor do XY forçando/travando, marcas de queimado na madeira, fresa muito quente</li>
          </ul>
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>Atenção:</strong> Feedrate muito alto quebra a fresa. Muito baixo queima a madeira e desgasta a fresa.
        </div>
      </>
    ),
  },

  plungeRate: {
    title: "Velocidade de Mergulho (Plunge Rate)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Velocidade de descida vertical (eixo Z) da fresa ao penetrar na madeira, em mm/min.
        </div>
        <div>
          <strong>Valores para madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF: 400-600 mm/min</li>
            <li>Compensado: 300-500 mm/min</li>
            <li>Madeira macia: 500-800 mm/min</li>
            <li>Madeira dura: 250-400 mm/min</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Regra simples:</strong> Use cerca de 30% do feedrate. Exemplo: se feedrate é 1500mm/min, plunge rate deve ser ~500mm/min.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>Atenção:</strong> Descer rápido demais na madeira pode quebrar a ponta da fresa ou causar lascas na entrada do corte.
        </div>
      </>
    ),
  },

  rapidsSpeed: {
    title: "Velocidade Rápida (Rapids Speed)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Velocidade máxima de movimentação da máquina durante posicionamentos rápidos (comandos G0), sem cortar material.
        </div>
        <div>
          <strong>Valores típicos para CNCs de madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>CNCs caseiras/hobby: 2000-4000 mm/min</li>
            <li>CNCs profissionais médias: 4000-6000 mm/min</li>
            <li>CNCs industriais: 6000-10000 mm/min</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Uso prático:</strong> Este valor é usado apenas para cálculo de tempo estimado. Quanto mais preciso for este valor (conforme sua máquina), melhor será a estimativa de tempo total de corte.
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800">
          <strong className="text-green-700 dark:text-green-400">Como descobrir:</strong> Consulte o manual da sua CNC ou execute um teste simples: mova a máquina 1000mm e meça o tempo. Velocidade = 1000mm ÷ tempo(min).
        </div>
      </>
    ),
  },

  spindleSpeed: {
    title: "Rotação do Spindle (Spindle Speed - RPM)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Velocidade de rotação da fresa ao cortar madeira, medida em RPM (rotações por minuto).
        </div>
        <div>
          <strong>Valores para madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF: 16000-20000 RPM</li>
            <li>Compensado: 16000-20000 RPM</li>
            <li>Madeira macia (pinus): 18000-22000 RPM</li>
            <li>Madeira dura (carvalho, ipê): 14000-18000 RPM</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Dica prática:</strong>
          <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
            <li>Fresa 3mm: 20000-24000 RPM (mais rápido para fresas pequenas)</li>
            <li>Fresa 6mm: 16000-18000 RPM (padrão mais usado)</li>
            <li>Fresa 12mm: 12000-14000 RPM (mais devagar para fresas grandes)</li>
          </ul>
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>Atenção:</strong> RPM muito baixo deixa acabamento áspero na madeira. RPM muito alto queima a madeira e desgasta a fresa rapidamente.
        </div>
      </>
    ),
  },

  usarRampa: {
    title: "Rampa de Entrada (Entry Ramp)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Técnica onde a fresa desce em ângulo enquanto avança horizontalmente, ao invés de mergulhar verticalmente no material.
        </div>
        <div className="space-y-2 mt-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
            <strong className="text-red-700 dark:text-red-400">Mergulho Vertical (sem rampa):</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>Fresa mergulha direto verticalmente no material</li>
              <li>Todo impacto de uma vez na ponta da ferramenta</li>
              <li>Maior desgaste e risco de quebra</li>
              <li>Vibração excessiva e acabamento ruim</li>
              <li>Sobrecarga do motor</li>
            </ul>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
            <strong className="text-green-700 dark:text-green-400">Rampa de Entrada (recomendado):</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>Fresa desce gradualmente enquanto avança</li>
              <li>Força de corte distribuída ao longo do movimento</li>
              <li>Vida útil da ferramenta aumenta 2-3x</li>
              <li>Menos vibração = melhor acabamento</li>
              <li>Motor trabalha mais suave</li>
              <li>Reduz drasticamente risco de quebra</li>
            </ul>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800 mt-3">
          <strong className="text-amber-700 dark:text-amber-400">Quando usar rampa:</strong>
          <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
            <li>Sempre em materiais duros (MDF, compensado, acrílico)</li>
            <li>Com fresas pequenas (até 8mm)</li>
            <li>Em cortes profundos (acima de 5mm)</li>
            <li>Menos crítico apenas em materiais muito macios (espuma, isopor)</li>
          </ul>
        </div>
        <div className="text-green-600 dark:text-green-400 mt-2">
          <strong>Recomendação:</strong> SEMPRE use rampa de entrada para preservar suas ferramentas e obter melhor qualidade de corte!
        </div>
      </>
    ),
  },

  anguloRampa: {
    title: "Ângulo da Rampa (Ramp Angle)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Inclinação da rampa de entrada em graus. Define quão suave será a descida da fresa no material.
        </div>
        <div>
          <strong>Valores recomendados:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>2° (rampa suave):</strong> Melhor para a ferramenta, ocupa mais espaço horizontal</li>
            <li><strong>3° (recomendado):</strong> Equilíbrio ideal entre proteção e eficiência</li>
            <li><strong>4° (rampa média):</strong> Bom compromisso, ainda protege bem a fresa</li>
            <li><strong>5° (rampa agressiva):</strong> Economiza tempo, ainda muito melhor que mergulho vertical</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800 mt-3">
          <strong className="text-amber-700 dark:text-amber-400">Exemplo prático:</strong>
          <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
            <li>Para descer 8mm com 2°: precisa ~230mm de avanço horizontal</li>
            <li>Para descer 8mm com 3°: precisa ~150mm de avanço horizontal</li>
            <li>Para descer 8mm com 5°: precisa ~90mm de avanço horizontal</li>
          </ul>
        </div>
        <div className="text-amber-600 dark:text-amber-500 mt-2">
          <strong>Atenção:</strong> O sistema verifica automaticamente se há espaço suficiente na chapa para a rampa. Se não houver, faz mergulho vertical e emite aviso.
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800 mt-2">
          <strong className="text-green-700 dark:text-green-400">Dica:</strong> Com peças de 500×500mm você tem espaço de sobra. Use 3° para máxima proteção da ferramenta!
        </div>
      </>
    ),
  },

  // Configurações da Chapa
  chapaLargura: {
    title: "Largura da Chapa (Width)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Dimensão horizontal da chapa de madeira disponível para corte (eixo X da CNC).
        </div>
        <div>
          <strong>Tamanhos padrões de chapas de madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF/Compensado BR: 2750×1830mm (tamanho grande)</li>
            <li>MDF/Compensado BR: 2200×1600mm (tamanho médio)</li>
            <li>MDF/Compensado USA: 2440×1220mm (4×8 pés)</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Importante:</strong> Use a área útil da sua CNC, não o tamanho da chapa completa. Exemplo: CNC com área de trabalho 2850×1500mm pode usar chapa de 2750×1400mm com folga.
        </div>
      </>
    ),
  },

  chapaAltura: {
    title: "Altura da Chapa (Height)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Dimensão vertical da chapa de madeira disponível para corte (eixo Y da CNC).
        </div>
        <div>
          <strong>Tamanhos padrões de chapas de madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF/Compensado BR: 2750×1830mm (tamanho grande)</li>
            <li>MDF/Compensado BR: 2200×1600mm (tamanho médio)</li>
            <li>MDF/Compensado USA: 2440×1220mm (4×8 pés)</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Importante:</strong> Use a área útil da sua CNC, não o tamanho da chapa completa. Deixe margem de segurança nas bordas.
        </div>
      </>
    ),
  },

  chapaEspessura: {
    title: "Espessura da Chapa (Thickness)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Espessura da madeira no eixo Z. Define quanto a fresa precisa descer para cortar completamente.
        </div>
        <div>
          <strong>Espessuras comuns de madeira:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF: 3mm, 6mm, 9mm, 12mm, 15mm, 18mm, 25mm</li>
            <li>Compensado: 4mm, 6mm, 9mm, 12mm, 15mm, 18mm</li>
            <li>Madeira maciça: variável, medir com paquímetro</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong className="text-amber-700 dark:text-amber-400">Dica prática:</strong> Se sua madeira tem 15mm, configure profundidade de corte para 15.5mm para garantir que corte completo sem deixar fibras conectadas.
        </div>
      </>
    ),
  },

  // Configurações da Ferramenta
  ferramentaDiametro: {
    title: "Diâmetro da Fresa (Tool Diameter)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Diâmetro da fresa (broca) em milímetros. Usado para compensação de caminho (G41/G42).
        </div>
        <div>
          <strong>Diâmetros comuns:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Detalhes finos: 1-3mm</li>
            <li>Cortes gerais: 4-6mm (mais comum)</li>
            <li>Desbaste: 8-12mm</li>
            <li>Cortes rápidos: 12-20mm</li>
          </ul>
        </div>
        <div>
          <strong>Quando usar menor:</strong> Detalhes pequenos, cantos internos apertados, furos pequenos.
        </div>
        <div>
          <strong>Quando usar maior:</strong> Cortes retos longos, desbaste rápido, maior estabilidade.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>Atenção:</strong> O valor informado aqui afeta a compensação de ferramenta (G41/G42). Use o diâmetro real da fresa.
        </div>
      </>
    ),
  },

  ferramentaNumero: {
    title: "Número da Ferramenta (Tool Number)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Identificador da ferramenta no magazine/trocador da CNC (T1, T2, T3...).
        </div>
        <div>
          <strong>Uso:</strong> Usado nos comandos de troca de ferramenta (T1 M6 = Troca para ferramenta 1).
        </div>
        <div>
          <strong>Valores típicos:</strong> 1-99 (depende da capacidade do trocador de ferramentas).
        </div>
        <div>
          <strong>Dica:</strong> Se sua máquina não tem trocador automático de ferramentas, geralmente usa-se T1.
        </div>
      </>
    ),
  },

  // Tipo de Corte
  tipoCorte: {
    title: "Tipo de Corte (Cut Type)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Define como a fresa deve compensar em relação ao caminho marcado ao cortar madeira.
        </div>
        <div className="space-y-3 mt-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-200 dark:border-orange-800">
            <strong className="text-orange-700 dark:text-orange-400">EXTERNO (G41 - Left Compensation)</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>Fresa corta FORA da marcação (ao redor da peça)</li>
              <li>Peça final fica com dimensões exatas programadas</li>
              <li>Usado para recortar peças retangulares da chapa</li>
              <li><strong>Exemplo:</strong> Programar retângulo 100×50mm → peça cortada sai com 100×50mm exatos</li>
            </ul>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
            <strong className="text-amber-700 dark:text-amber-400">INTERNO (G42 - Right Compensation)</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>Fresa corta DENTRO da marcação (para fazer furos/rasgos)</li>
              <li>Furo/recorte final fica com dimensões exatas programadas</li>
              <li>Usado para fazer janelas, furos retangulares na madeira</li>
              <li><strong>Exemplo:</strong> Programar furo 50×30mm → furo cortado sai com 50×30mm exatos</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800">
            <strong className="text-yellow-700 dark:text-yellow-400">NA LINHA (G40 - No Compensation)</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>Centro da fresa segue exatamente o caminho programado</li>
              <li>Peça fica maior/menor dependendo do diâmetro da fresa</li>
              <li>Usado para gravações, sulcos decorativos na madeira</li>
              <li><strong>Exemplo:</strong> Gravar logo ou texto na superfície da madeira</li>
            </ul>
          </div>
        </div>
        <div className="text-amber-600 dark:text-amber-500 mt-3">
          <strong>Atenção:</strong> Escolher tipo errado faz a peça de madeira sair com tamanho incorreto (diferença = diâmetro da fresa)!
        </div>
      </>
    ),
  },
};
