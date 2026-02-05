// ============================================
// JSON Transformation API - Express Server
// ============================================
// This API receives JSON data and transforms it according to a fixed mapping schema.
// It handles nested object traversal and returns transformed JSON with error handling.

const express = require("express")
const bodyParser = require("body-parser")

// Initialize Express application
const app = express()
const PORT = 3000

// Middleware: Parse JSON bodies with a limit to handle larger payloads
app.use(bodyParser.json({ limit: "10mb" }))

// ============================================
// Mapa de Referência (Reference Mapping Schema)
// ============================================
// This fixed mapping defines how to transform the input JSON:
// - Campo: The output field name
// - Valor: The path to find the value in the input object (supports nested paths with dot notation)
const mapa = [
  { Campo: "Nome", Valor: "Coluna01" },
  { Campo: "Cidade", Valor: "Endereco.Coluna02" },
  { Campo: "Email", Valor: "Contato.Email" },
]

// ============================================
// Função Auxiliar: Buscar Valor Recursivamente
// ============================================
// This function recursively traverses nested objects using a dot-notation path.
// It safely handles missing properties and returns null if the path doesn't exist.
//
// @param {Object} obj - The object to search within
// @param {String} path - The dot-notation path (e.g., "Endereco.Coluna02")
// @returns {*} The value found at the path, or null if not found
function buscarValorRecursivo(obj, path) {
  if(!path || !obj) return null
  
  // Split the path by dots to get individual keys
  const chaves = path.split(".")

  // Traverse through each key in the path
  let valor = obj
  for (const chave of chaves) {
    // Check if the current level has the key
    if (valor && typeof valor === "object" && chave in valor) {
      valor = valor[chave]
    } else {
      // If at any point the key doesn't exist, return null
      return null
    }
  }

  return valor
}

// ============================================
// Função Principal: Transformar Registro
// ============================================
// This function applies the mapping schema to a single record.
// It creates a new object with fields defined by the mapa, extracting values from the input record.
//
// @param {Object} registro - A single input record
// @returns {Object} A transformed record with the mapped fields
function transformarRegistro(registro) {
  const registroTransformado = {}

  // Iterate through the mapping schema
  for (const item of mapa) {
    // Extract the output field name and the path to find the value
    const { Campo, Valor } = item

    // Recursively search for the value in the input record
    const valor = buscarValorRecursivo(registro, Valor)

    // Add the field to the transformed record (null if not found)
    registroTransformado[Campo] = valor
  }

  return registroTransformado
}

// ============================================
// Rota de Saúde: GET /
// ============================================
// Basic health check endpoint to verify the API is running.
// Returns a simple status message.
app.get("/", (req, res) => {
  res.status(200).json({ status: "API ativa", timestamp: new Date().toISOString() })
})

// ============================================
// Rota Principal: POST /transformar
// ============================================
// Main transformation endpoint that accepts JSON data and returns transformed output.
// Accepts both single objects and arrays of objects.
// Includes error handling for malformed JSON and missing fields.
app.post("/transformar", (req, res) => {
  try {
    // Get the request body
    const dados = req.body

    // Validate that data was provided
    if (!dados) {
      return res.status(400).json({
        erro: true,
        mensagem: "Corpo da requisição vazio",
        dados: null,
      })
    }

    let resultado

    // Check if the input is an array or a single object
    if (Array.isArray(dados)) {
      // If it's an array, transform each record
      resultado = dados.map((registro) => {
        // Ensure each item is an object
        if (typeof registro === "object" && registro !== null) {
          return transformarRegistro(registro)
        } else {
          // If an array item is not an object, return null for that record
          return null
        }
      })
    } else if (typeof dados === "object") {
      // If it's a single object, transform it and return as a single result
      resultado = transformarRegistro(dados)
    } else {
      // If it's neither an array nor an object, return an error
      return res.status(400).json({
        erro: true,
        mensagem: "O corpo da requisição deve ser um objeto JSON ou um array de objetos",
        dados: null,
      })
    }

    // Return the transformed data with success status
    res.status(200).json({
      erro: false,
      mensagem: "Transformação realizada com sucesso",
      dados: resultado,
    })
  } catch (erro) {
    // Handle any unexpected errors (malformed JSON, etc.)
    console.error("Erro ao processar requisição:", erro.message)
    res.status(500).json({
      erro: true,
      mensagem: "Erro ao processar a requisição: " + erro.message,
      dados: null,
    })
  }
})

// ============================================
// Iniciar Servidor
// ============================================
// Start the Express server on the specified port
app.listen(PORT, () => {
  console.log(`✓ Servidor iniciado na porta ${PORT}`)
  console.log(`✓ GET  / - Health check`)
  console.log(`✓ POST /transformar - Endpoint de transformação JSON`)
  console.log(`\nExemplo de uso:`)
  console.log(`curl -X POST http://localhost:${PORT}/transformar \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  console.log(
    `  -d '[{"Coluna01":"Erick","Endereco":{"Coluna02":"Belo Horizonte"},"Contato":{"Email":"erick@email.com"}}]'`,
  )
})
