export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3">API Gerador de JSON</h1>
          <p className="text-xl text-slate-300">
            Transforme estruturas JSON complexas usando um mapa de mapeamento dinâmico
          </p>
        </div>

        {/* Endpoint */}
        <section className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
          <div className="space-y-4">
            <div className="bg-slate-900 rounded p-4 font-mono text-sm border-l-4 border-blue-500">
              <span className="text-green-400">POST</span>
              <span className="text-slate-300"> /api/transformar</span>
              <p className="text-slate-400 font-normal mt-1">Transforma JSON de origem seguindo mapa de mapeamento</p>
            </div>
            <div className="bg-slate-900 rounded p-4 font-mono text-sm border-l-4 border-purple-500">
              <span className="text-green-400">POST</span>
              <span className="text-slate-300"> /api/transformar/lista</span>
              <p className="text-slate-400 font-normal mt-1">
                Retorna uma listagem plana de todos os dados transformados com ID
              </p>
            </div>
          </div>
        </section>

        {/* Request Format */}
        <section className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Formato da Requisição</h2>
          <p className="text-slate-300 mb-4">Envie um JSON com os campos:</p>
          <div className="bg-slate-900 rounded p-4 overflow-x-auto">
            <pre className="font-mono text-sm text-slate-100">{`{
  "origem": [
    {
      "Coluna01": "Erick",
      "Endereco": { "Coluna02": "Belo Horizonte" },
      "Contato": { "Email": "erick@email.com" },
      "shippings": [
        {
          "method": "express",
          "pricePaid": 50.00,
          "items": [
            { "productId": "P001", "qty": 2 },
            { "productId": "P002", "qty": 1 }
          ]
        }
      ]
    }
  ],
  "saida": [
    {
      "desc": "Produto",
      "tabela": "SA1010",
      "mapa": [
        { "Campo": "Nome", "Valor": "Coluna01", "Tipo": "customizado" },
        { "Campo": "Cidade", "Valor": "Endereco.Coluna02", "Tipo": "customizado" },
        { "Campo": "Email", "Valor": "Contato.Email", "Tipo": "customizado" },
        { "Campo": "Empresa", "Valor": "EmpresaXPTO", "Tipo": "fixo" }
      ]
    },
    {
      "desc": "Itens",
      "tabela": "SA1010D",
      "mapa": [
        { "Campo": "CodigoProduto", "Valor": "productId", "Tipo": "customizado" },
        { "Campo": "Quantidade", "Valor": "qty", "Tipo": "customizado" }
      ]
    },
    {
      "desc": "Entrega",
      "tabela": "SA1011",
      "mapa": [
        { "Campo": "MetodoEntrega", "Valor": "shippings[0].method", "Tipo": "customizado" },
        { "Campo": "ValorFrete", "Valor": "shippings[0].pricePaid", "Tipo": "customizado" }
      ]
    }
  ]
}`}</pre>
          </div>
        </section>

        {/* Response Format */}
        <section className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Formato da Resposta</h2>
          <div className="bg-slate-900 rounded p-4 overflow-x-auto">
            <pre className="font-mono text-sm text-slate-100">{`{
  "erro": false,
  "mensagem": "Transformação realizada com sucesso",
  "dados": [
    {
      "item": [
        {
          "desc": "Produto",
          "saida": {
            "Tabela": "SA1010",
            "Campos": {
              "Nome": "Erick",
              "Cidade": "Belo Horizonte",
              "Email": "erick@email.com",
              "Empresa": "EmpresaXPTO"
            }
          }
        },
        {
          "desc": "Itens",
          "saida": {
            "Tabela": "SA1010D",
            "Campos": [
              {
                "CodigoProduto": "P001",
                "Quantidade": 2
              },
              {
                "CodigoProduto": "P002",
                "Quantidade": 1
              }
            ]
          }
        },
        {
          "desc": "Entrega",
          "saida": {
            "Tabela": "SA1011",
            "Campos": {
              "MetodoEntrega": "express",
              "ValorFrete": 50.00
            }
          }
        }
      ]
    }
  ]
}`}</pre>
          </div>
        </section>

        {/* Parameters */}
        <section className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Parâmetros</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-blue-400 mb-2">origem (obrigatório)</h3>
              <p className="text-slate-300">
                Um objeto ou array de objetos a serem transformados. A API processará cada registro de origem para cada
                configuração de saída fornecida.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400 mb-2">saida (obrigatório)</h3>
              <p className="text-slate-300">Array de configurações de transformação. Cada configuração deve ter:</p>
              <ul className="list-disc list-inside text-slate-300 mt-2 ml-2">
                <li>
                  <span className="font-mono text-slate-200">desc</span>: Descrição da saída
                </li>
                <li>
                  <span className="font-mono text-slate-200">tabela</span>: Nome da tabela
                </li>
                <li>
                  <span className="font-mono text-slate-200">mapa</span>: Array de mapeamento onde cada objeto tem:
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>
                      <span className="font-mono text-slate-200">Campo</span>: Nome do campo na saída
                    </li>
                    <li>
                      <span className="font-mono text-slate-200">Valor</span>: Caminho do valor (apenas para tipo
                      "customizado")
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>
                          Para campos normais: use dot-notation (ex:{" "}
                          <span className="font-mono text-slate-200">Endereco.Coluna02</span>)
                        </li>
                        <li>
                          Para dados de shippings: especifique o índice (ex:{" "}
                          <span className="font-mono text-slate-200">shippings[0].method</span>)
                        </li>
                        <li>
                          Para itens (desc="Itens"): use apenas o nome do campo do item (ex:{" "}
                          <span className="font-mono text-slate-200">productId</span>)
                        </li>
                      </ul>
                    </li>
                    <li>
                      <span className="font-mono text-slate-200">Tipo</span>: "customizado" ou "fixo"
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>
                          <span className="font-mono text-slate-200">customizado</span>: Busca o valor no JSON de origem
                        </li>
                        <li>
                          <span className="font-mono text-slate-200">fixo</span>: Insere o valor literal sem consultar
                          origem
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Características</h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Múltiplas configurações de saída (saida array)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Processa cada registro de origem para cada configuração de saída</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Suporte para campos fixos e customizados</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Tratamento especial para desc="Itens": expande automaticamente de shippings[0].items</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Busca recursiva de valores em objetos aninhados</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Suporte para dot-notation e array indexing (ex: Endereco.Coluna02, shippings[0].method)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Validação robusta de entrada e tratamento de erros</span>
            </li>
          </ul>
        </section>

        {/* Lista Endpoint */}
        <section className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Endpoint: /api/transformar/lista</h2>
          <p className="text-slate-300 mb-4">
            Retorna uma listagem plana com um registro por linha, incluindo o ID de cada origem.
          </p>

          <h3 className="font-bold text-blue-400 mb-3">Formato da Resposta</h3>
          <div className="bg-slate-900 rounded p-4 overflow-x-auto mb-4">
            <pre className="font-mono text-sm text-slate-100">{`{
  "erro": false,
  "mensagem": "Transformação realizada com sucesso",
  "Lista": [
    {
      "id": "123",
      "desc": "Produto",
      "tabela": "SA1010",
      "campo": "Nome",
      "valor": "Erick"
    },
    {
      "id": "123",
      "desc": "Produto",
      "tabela": "SA1010",
      "campo": "Cidade",
      "valor": "Belo Horizonte"
    },
    {
      "id": "123",
      "desc": "Itens",
      "tabela": "SA1010D",
      "campo": "CodigoProduto",
      "valor": "P001"
    },
    {
      "id": "123",
      "desc": "Itens",
      "tabela": "SA1010D",
      "campo": "Quantidade",
      "valor": "2"
    }
  ]
}`}</pre>
          </div>

          <h3 className="font-bold text-blue-400 mb-3">Características da Lista</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>
                <span className="font-mono text-slate-200">id</span>: Campo ID do registro de origem
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>
                <span className="font-mono text-slate-200">desc</span>: Descrição da configuração de saída
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>
                <span className="font-mono text-slate-200">tabela</span>: Nome da tabela
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>
                <span className="font-mono text-slate-200">campo</span>: Nome do campo transformado
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>
                <span className="font-mono text-slate-200">valor</span>: Valor transformado
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Um registro por campo (para itens, um registro por item)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span>Fácil para importação em sistemas e relatórios</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
