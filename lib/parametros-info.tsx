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
          <strong>O que é:</strong> A profundidade total que a fresa irá penetrar no material.
        </div>
        <div>
          <strong>Valores típicos:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Madeira macia: 5-20mm</li>
            <li>Madeira dura: 3-10mm</li>
            <li>MDF: 5-18mm</li>
            <li>Acrílico: 3-10mm</li>
            <li>Alumínio: 1-5mm</li>
          </ul>
        </div>
        <div>
          <strong>Quando aumentar:</strong> Materiais mais macios, fresas mais robustas, máquina mais potente.
        </div>
        <div>
          <strong>Quando diminuir:</strong> Materiais duros/frágeis, fresas pequenas, máquina menos rígida, acabamento fino.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>⚠️ Atenção:</strong> Profundidade excessiva pode quebrar a fresa ou causar acabamento ruim.
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
          <strong>⚠️ Atenção:</strong> Espaçamento insuficiente pode causar deslocamento de peças durante o corte.
        </div>
      </>
    ),
  },

  profundidadePorPassada: {
    title: "Profundidade por Passada (Depth per Pass)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Quanto a fresa desce em cada passada (múltiplas passadas até atingir profundidade total).
        </div>
        <div>
          <strong>Valores típicos:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Madeira: 2-6mm por passada</li>
            <li>MDF: 3-8mm por passada</li>
            <li>Acrílico: 1-3mm por passada</li>
            <li>Alumínio: 0.5-2mm por passada</li>
          </ul>
        </div>
        <div>
          <strong>Regra prática:</strong> Use 50-100% do diâmetro da fresa como profundidade por passada.
        </div>
        <div>
          <strong>Quando aumentar:</strong> Materiais macios, fresas grandes (>6mm), cortes rápidos (qualidade não crítica).
        </div>
        <div>
          <strong>Quando diminuir:</strong> Materiais duros/quebradiços, fresas pequenas, acabamento fino, máquina com pouca rigidez.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>⚠️ Atenção:</strong> Passadas muito profundas aumentam carga na fresa e risco de quebra.
        </div>
      </>
    ),
  },

  feedrate: {
    title: "Velocidade de Avanço (Feedrate)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Velocidade lateral da fresa durante o corte, medida em mm/min.
        </div>
        <div>
          <strong>Valores típicos:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Madeira macia: 1500-3000 mm/min</li>
            <li>Madeira dura: 1000-2000 mm/min</li>
            <li>MDF: 1500-2500 mm/min</li>
            <li>Acrílico: 800-1500 mm/min</li>
            <li>Alumínio: 400-1000 mm/min</li>
          </ul>
        </div>
        <div>
          <strong>Quando aumentar:</strong> Materiais macios, cortes de desbaste, fresas novas/afiadas, máquina potente.
        </div>
        <div>
          <strong>Quando diminuir:</strong> Materiais duros, acabamento fino, fresas pequenas/gastas, curvas acentuadas.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>⚠️ Atenção:</strong> Feedrate muito alto causa acabamento ruim e quebra de fresa. Muito baixo queima o material.
        </div>
      </>
    ),
  },

  plungeRate: {
    title: "Velocidade de Mergulho (Plunge Rate)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Velocidade de descida vertical (eixo Z) da fresa ao penetrar no material, em mm/min.
        </div>
        <div>
          <strong>Valores típicos:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Madeira: 300-800 mm/min</li>
            <li>MDF: 400-700 mm/min</li>
            <li>Acrílico: 200-500 mm/min</li>
            <li>Alumínio: 100-300 mm/min</li>
          </ul>
        </div>
        <div>
          <strong>Regra prática:</strong> Use 30-50% do feedrate como plunge rate.
        </div>
        <div>
          <strong>Quando aumentar:</strong> Materiais macios, fresas com ponta apropriada para mergulho.
        </div>
        <div>
          <strong>Quando diminuir:</strong> Materiais duros/quebradiços, fresas sem ponta de centro, furos profundos.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>⚠️ Atenção:</strong> Mergulho muito rápido pode quebrar a fresa, especialmente em fresas sem ponta de centro.
        </div>
      </>
    ),
  },

  spindleSpeed: {
    title: "Rotação do Spindle (Spindle Speed - RPM)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Velocidade de rotação da fresa, medida em RPM (rotações por minuto).
        </div>
        <div>
          <strong>Valores típicos:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Madeira: 18000-24000 RPM</li>
            <li>MDF: 16000-20000 RPM</li>
            <li>Acrílico: 10000-18000 RPM (evitar derretimento)</li>
            <li>Alumínio: 8000-15000 RPM</li>
          </ul>
        </div>
        <div>
          <strong>Relação com diâmetro da fresa:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Fresas pequenas (3-6mm): 18000-24000 RPM</li>
            <li>Fresas médias (6-12mm): 12000-18000 RPM</li>
            <li>Fresas grandes (12mm+): 8000-12000 RPM</li>
          </ul>
        </div>
        <div>
          <strong>Quando aumentar:</strong> Fresas pequenas, materiais macios, acabamento liso.
        </div>
        <div>
          <strong>Quando diminuir:</strong> Fresas grandes, materiais que derretem (acrílico), metais.
        </div>
        <div className="text-amber-600 dark:text-amber-500">
          <strong>⚠️ Atenção:</strong> RPM muito alto pode derreter plásticos. RPM muito baixo causa acabamento ruim e sobrecarga.
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
          <strong>O que é:</strong> Dimensão horizontal da chapa de material disponível para corte (eixo X).
        </div>
        <div>
          <strong>Tamanhos padrões de chapas:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF/Compensado: 2750x1830mm, 2440x1220mm</li>
            <li>Acrílico: 2000x3000mm, 2050x3050mm</li>
            <li>Alumínio: 2000x1000mm, 2500x1250mm</li>
          </ul>
        </div>
        <div>
          <strong>Dica:</strong> Considere a área útil da máquina CNC, que pode ser menor que a chapa.
        </div>
      </>
    ),
  },

  chapaAltura: {
    title: "Altura da Chapa (Height)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Dimensão vertical da chapa de material disponível para corte (eixo Y).
        </div>
        <div>
          <strong>Tamanhos padrões de chapas:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF/Compensado: 2750x1830mm, 2440x1220mm</li>
            <li>Acrílico: 2000x3000mm, 2050x3050mm</li>
            <li>Alumínio: 2000x1000mm, 2500x1250mm</li>
          </ul>
        </div>
        <div>
          <strong>Dica:</strong> Considere a área útil da máquina CNC, que pode ser menor que a chapa.
        </div>
      </>
    ),
  },

  chapaEspessura: {
    title: "Espessura da Chapa (Thickness)",
    content: (
      <>
        <div>
          <strong>O que é:</strong> Altura do material no eixo Z. Geralmente define a profundidade de corte total.
        </div>
        <div>
          <strong>Espessuras comuns:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>MDF: 3mm, 6mm, 9mm, 12mm, 15mm, 18mm, 25mm</li>
            <li>Compensado: 4mm, 6mm, 9mm, 12mm, 15mm, 18mm</li>
            <li>Acrílico: 2mm, 3mm, 5mm, 6mm, 8mm, 10mm</li>
            <li>Alumínio: 1mm, 2mm, 3mm, 5mm, 6mm</li>
          </ul>
        </div>
        <div>
          <strong>Dica:</strong> A profundidade de corte deve ser igual ou ligeiramente maior que a espessura para garantir corte completo.
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
          <strong>⚠️ Atenção:</strong> O valor informado aqui afeta a compensação de ferramenta (G41/G42). Use o diâmetro real da fresa.
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
          <strong>O que é:</strong> Define como a fresa deve compensar em relação ao caminho marcado.
        </div>
        <div className="space-y-3 mt-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
            <strong className="text-blue-700 dark:text-blue-300">🔵 Externo (G41 - Left Compensation)</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Fresa corta FORA da marcação</li>
              <li>Peça final fica com dimensões exatas</li>
              <li>Usado para recortar peças</li>
              <li>Exemplo: Cortar retângulo de 100x50mm, peça sai com 100x50mm</li>
            </ul>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-950 rounded">
            <strong className="text-red-700 dark:text-red-300">🔴 Interno (G42 - Right Compensation)</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Fresa corta DENTRO da marcação</li>
              <li>Usado para fazer furos e recortes internos</li>
              <li>Furo/recorte final fica com dimensões exatas</li>
              <li>Exemplo: Fazer furo de 50mm, furo sai com 50mm</li>
            </ul>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <strong className="text-gray-700 dark:text-gray-300">⚪ Na Linha (G40 - No Compensation)</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Centro da fresa segue exatamente o caminho</li>
              <li>Peça fica maior/menor dependendo do diâmetro da fresa</li>
              <li>Usado para gravações, sulcos, ou quando compensação é calculada no CAD</li>
            </ul>
          </div>
        </div>
        <div className="text-amber-600 dark:text-amber-500 mt-3">
          <strong>⚠️ Atenção:</strong> Escolha errada do tipo de corte resulta em peças com dimensões incorretas!
        </div>
      </>
    ),
  },
};
