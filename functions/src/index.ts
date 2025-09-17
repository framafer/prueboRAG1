import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

// Función para inicializar Gemini de forma segura
function initializeGemini() {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyBf9Fdc5GZ6JWeDrHrVQSmDuvKAEhaHUwY';
    
    if (!geminiKey) {
      console.log('API key de Gemini no configurada');
      return null;
    }
    
    console.log('Inicializando Gemini con API key');
    return new GoogleGenerativeAI(geminiKey);
  } catch (error) {
    console.error('Error al inicializar Gemini:', error);
    return null;
  }
}

// Cloud Function HTTP simple
export const guardarTexto = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const { texto } = req.body;
      if (!texto || texto.length < 5) {
        res.status(400).json({ success: false, error: "Texto demasiado corto" });
        return;
      }

      console.log('Procesando texto:', texto.substring(0, 50));
      let embedding = null;
      
      // Intentar generar embedding
      const genAI = initializeGemini();
      if (genAI) {
        try {
          console.log('Generando embedding...');
          const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
          const result = await model.embedContent(texto);
          
          if (result.embedding && result.embedding.values) {
            embedding = result.embedding.values;
            console.log('Embedding generado exitosamente, longitud:', embedding.length);
          }
        } catch (embeddingError) {
          console.error('Error al generar embedding:', embeddingError);
        }
      }
      
      // Guardar en Firestore
      const docData: any = {
        texto,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      if (embedding) {
        docData.embedding = embedding;
        console.log('Guardando con embedding');
      } else {
        console.log('Guardando sin embedding');
      }
      
      const docRef = await db.collection("manualRag").add(docData);

      res.json({ success: true, id: docRef.id });
    } catch (error: any) {
      console.error("Error en generarEmbedding:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// Función para calcular similitud coseno
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Cloud Function para responder preguntas con RAG
export const preguntarRAG = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const { pregunta } = req.body;
      if (!pregunta || pregunta.length < 3) {
        res.status(400).json({ success: false, error: "Pregunta demasiado corta" });
        return;
      }

      console.log('Procesando pregunta:', pregunta);
      
      const genAI = initializeGemini();
      if (!genAI) {
        res.status(500).json({ success: false, error: "Gemini no disponible" });
        return;
      }

      // 1. Generar embedding de la pregunta
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const questionResult = await model.embedContent(pregunta);
      const questionEmbedding = questionResult.embedding.values;

      // 2. Obtener todos los chunks de Firestore
      const snapshot = await db.collection('manualRag').get();
      const chunks: Array<{texto: string, embedding: number[], similarity: number}> = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.embedding && data.texto) {
          const similarity = cosineSimilarity(questionEmbedding, data.embedding);
          chunks.push({
            texto: data.texto,
            embedding: data.embedding,
            similarity
          });
        }
      });

      // 3. Ordenar por similitud y tomar los top 3
      chunks.sort((a, b) => b.similarity - a.similarity);
      const topChunks = chunks.slice(0, 3);
      
      console.log('Top chunks encontrados:', topChunks.length);
      console.log('Similitudes:', topChunks.map(c => c.similarity));

      // 4. Crear contexto y generar respuesta
      const contexto = topChunks.map(chunk => chunk.texto).join('\n\n');
      const prompt = `Basándote únicamente en el siguiente contexto, responde la pregunta. Si la información no está en el contexto, di que no tienes esa información.\n\nContexto:\n${contexto}\n\nPregunta: ${pregunta}\n\nRespuesta:`;
      
      const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await chatModel.generateContent(prompt);
      const respuesta = await result.response.text();

      res.json({ 
        success: true, 
        respuesta,
        chunksUsados: topChunks.length,
        similitudes: topChunks.map(c => c.similarity)
      });

    } catch (error: any) {
      console.error("Error en preguntarRAG:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});
