import { google } from '@ai-sdk/google';
import {
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
} from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json(
        { error: 'Clé API Google manquante' },
        { status: 500 }
      );
    }

    if (!process.env.TAVILY_API_KEY) {
      return Response.json(
        { error: 'Clé API Tavily manquante' },
        { status: 500 }
      );
    }

    const result = streamText({
      model: google('gemini-3.5-flash-lite'),

      system: `
Tu es un assistant IA utile, précis et fiable.

Tu réponds toujours en français.

Tu disposes d'un outil de recherche Web appelé webSearch.

RÈGLE IMPORTANTE :

Tu dois utiliser webSearch lorsque tu n'es pas certain d'une information
ou lorsque l'information peut être récente, actuelle ou avoir changé.

Utilise notamment webSearch pour :

- les personnes que tu ne connais pas avec certitude ;
- les joueurs de football ;
- les clubs et les effectifs actuels ;
- les joueurs qui évoluent actuellement dans un club ;
- les internationaux ;
- les transferts ;
- les actualités ;
- les résultats sportifs ;
- les compétitions ;
- les récompenses ;
- les nominations ;
- les informations concernant 2026 ;
- les événements récents ;
- toute information susceptible d'avoir changé.

Tu dois également utiliser webSearch lorsqu'un utilisateur te demande
"qui est", "tu connais", "est-ce que", "où joue", "quel est son club",
"quel est son parcours", etc. et que tu n'es pas absolument certain
de la réponse.

NE DEVINE JAMAIS l'identité d'une personne.

Si tu connais mal une personne ou si plusieurs personnes portent un nom
similaire, utilise d'abord webSearch.

Après une recherche Web :

- base ta réponse sur les résultats trouvés ;
- privilégie les sources fiables ;
- privilégie les informations récentes ;
- ne fabrique aucune information ;
- si les sources sont contradictoires, indique-le clairement ;
- ne présente pas une supposition comme un fait.

Pour les questions générales et stables que tu connais avec certitude,
tu peux répondre directement sans recherche.

Tu peux utiliser webSearch plusieurs fois si la première recherche
ne permet pas de répondre correctement.
`,

      tools: {
        webSearch: tool({
          description:
            'Recherche des informations actuelles ou vérifie une information sur Internet. Utilise cet outil lorsque tu n’es pas certain d’une information, notamment pour les personnes, les joueurs, les clubs, les actualités, les transferts et les événements récents.',

          inputSchema: z.object({
            query: z
              .string()
              .describe(
                'La requête précise à rechercher sur Internet.'
              ),
          }),

          execute: async ({ query }) => {
            console.log(`🔎 Recherche Web : ${query}`);

            const response = await fetch(
              'https://api.tavily.com/search',
              {
                method: 'POST',

                headers: {
                  'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                  api_key: process.env.TAVILY_API_KEY,

                  query,

                  search_depth: 'basic',

                  topic: 'general',

                  max_results: 5,

                  include_answer: true,

                  include_raw_content: false,
                }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();

              console.error(
                'Erreur Tavily :',
                errorText
              );

              return {
                success: false,
                error:
                  'La recherche Web a échoué.',
              };
            }

            const data = await response.json();

            return {
              success: true,

              answer:
                data.answer || '',

              results: (data.results || []).map(
                (result: any) => ({
                  title: result.title,
                  url: result.url,
                  content: result.content,
                })
              ),
            };
          },
        }),
      },

      stopWhen: stepCountIs(3),

      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error(
      'Erreur API Chat:',
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur inconnue',
      },
      {
        status: 500,
      }
    );
  }
}