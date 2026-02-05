import { type NextRequest, NextResponse } from "next/server"

// Recursively find values in nested objects using dot-notation paths
function buscarValorRecursivo(obj: any, path: string): any {
  // Replace [0], [1], etc. with .0, .1 to normalize the path
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1")
  const chaves = normalizedPath.split(".")
  let valor = obj

  for (const chave of chaves) {
    if (!chave) continue // Skip empty strings from double dots

    if (valor && typeof valor === "object") {
      // Try to access as property or array index
      valor = valor[chave]
    } else {
      return null
    }
  }

  return valor
}

// Generate flat list of transformed fields
function gerarListaRegistro(registro: any, id: string, saidaConfigs: any[]): any[] {
  const lista: any[] = []

  for (const config of saidaConfigs) {
    const { desc, tabela, mapa } = config

    if (desc === "Itens") {
      if (registro.shippings && Array.isArray(registro.shippings) && registro.shippings.length > 0) {
        const primeiroShipping = registro.shippings[0]
        if (primeiroShipping.items && Array.isArray(primeiroShipping.items)) {
          primeiroShipping.items.forEach((item: any) => {
            for (const campo of mapa) {
              const { Campo, Valor, Tipo } = campo

              let valor: any
              if (Tipo === "fixo") {
                valor = Valor
              } else {
                valor = buscarValorRecursivo(item, Valor)
              }

              lista.push({
                id: id,
                desc: desc,
                tabela: tabela,
                campo: Campo,
                valor: valor,
              })
            }
          })
        }
      }
    } else {
      for (const campo of mapa) {
        const { Campo, Valor, Tipo } = campo

        let valor: any
        if (Tipo === "fixo") {
          valor = Valor
        } else {
          valor = buscarValorRecursivo(registro, Valor)
        }

        lista.push({
          id: id,
          desc: desc,
          tabela: tabela,
          campo: Campo,
          valor: valor,
        })
      }
    }
  }

  return lista
}

function adicionarHeadersCORS(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origem, saida } = body

    // Validate origem
    if (!origem) {
      return adicionarHeadersCORS(
        NextResponse.json(
          {
            erro: true,
            mensagem: "Campo 'origem' é obrigatório",
            dados: null,
          },
          { status: 400 },
        ),
      )
    }

    // Validate saida
    if (!saida || !Array.isArray(saida) || saida.length === 0) {
      return adicionarHeadersCORS(
        NextResponse.json(
          {
            erro: true,
            mensagem: "Campo 'saida' é obrigatório e deve ser um array não vazio",
            dados: null,
          },
          { status: 400 },
        ),
      )
    }

    // Validate each saida configuration
    const saidaValida = saida.every((config) => {
      if (!config || typeof config !== "object") return false
      if (!("mapa" in config)) return false
      if (!Array.isArray(config.mapa) || config.mapa.length === 0) return false
      return config.mapa.every((item) => item && "Campo" in item && "Valor" in item)
    })

    if (!saidaValida) {
      return adicionarHeadersCORS(
        NextResponse.json(
          {
            erro: true,
            mensagem: "Cada configuração em 'saida' deve ter um 'mapa' válido com campos 'Campo' e 'Valor'",
            dados: null,
          },
          { status: 400 },
        ),
      )
    }

    // Ensure origem is an array
    const origemArray = Array.isArray(origem) ? origem : [origem]

    const lista: any[] = []
    for (const registro of origemArray) {
      const id = registro.id || ""
      const registroLista = gerarListaRegistro(registro, id, saida)
      lista.push(...registroLista)
    }

    return adicionarHeadersCORS(
      NextResponse.json(
        {
          erro: false,
          mensagem: "Lista gerada com sucesso",
          dados: {
            Lista: lista,
          },
        },
        { status: 200 },
      ),
    )
  } catch (erro) {
    console.error("Erro ao processar requisição:", erro)
    return adicionarHeadersCORS(
      NextResponse.json(
        {
          erro: true,
          mensagem: "Erro ao processar a requisição: JSON inválido",
          dados: null,
        },
        { status: 500 },
      ),
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
}
