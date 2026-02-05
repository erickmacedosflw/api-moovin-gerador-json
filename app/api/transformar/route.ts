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

// Transform a single record using the provided mapping schema
function transformarRegistro(registro: any, mapa: any[]): any {
  const registroTransformado: any = {}

  for (const item of mapa) {
    const { Campo, Valor, Tipo } = item

    if (Tipo === "fixo") {
      // Campo fixo: insere o valor literal do campo "Valor"
      registroTransformado[Campo] = Valor
    } else {
      // User can specify paths like "shippings[0].method", "payments[0].method", etc.
      const valor = buscarValorRecursivo(registro, Valor)
      registroTransformado[Campo] = valor
    }
  }

  return registroTransformado
}

function transformarItens(registro: any, mapa: any[]): any[] {
  if (!registro.shippings || !Array.isArray(registro.shippings) || registro.shippings.length === 0) {
    return []
  }

  const primeiroShipping = registro.shippings[0]
  if (!primeiroShipping.items || !Array.isArray(primeiroShipping.items)) {
    return []
  }

  return primeiroShipping.items.map((item: any) => {
    const registroTransformado: any = {}

    for (const campo of mapa) {
      const { Campo, Valor, Tipo } = campo

      if (Tipo === "fixo") {
        registroTransformado[Campo] = Valor
      } else {
        // Inside "Itens", use value directly on the item object
        const valor = buscarValorRecursivo(item, Valor)
        registroTransformado[Campo] = valor
      }
    }

    return registroTransformado
  })
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

    const dados = origemArray.map((registro) => {
      const item = saida.map((config) => {
        const { desc, tabela, mapa } = config

        let resultado: any

        if (desc === "Itens") {
          const itensTransformados = transformarItens(registro, mapa)
          resultado = {
            desc: desc,
            saida: {
              Tabela: tabela,
              Campos: itensTransformados,
            },
          }
        } else {
          const camposTransformados = transformarRegistro(registro, mapa)
          resultado = {
            desc: desc,
            saida: {
              Tabela: tabela,
              Campos: camposTransformados,
            },
          }
        }

        return resultado
      })

      return { item }
    })

    return adicionarHeadersCORS(
      NextResponse.json(
        {
          erro: false,
          mensagem: "Transformação realizada com sucesso",
          dados: dados,
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
