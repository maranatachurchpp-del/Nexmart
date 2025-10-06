import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  forceRefresh: z.boolean().optional()
}).optional();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body if present
    if (req.body) {
      try {
        const body = await req.json();
        requestSchema.parse(body);
      } catch (validationError) {
        console.error('Validation error:', validationError);
        return new Response(
          JSON.stringify({ error: 'Invalid request format', details: String(validationError) }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating smart alerts for user:', user.id);

    // Get user's business data (mock data for now - você pode substituir por dados reais)
    const businessData = {
      company_name: "Supermercado Exemplo",
      monthly_revenue: 850000,
      target_margin: 18,
      current_margin: 15.2,
      products_analyzed: 1250,
      rupture_rate: 8.5,
      competitor_price_advantage: -2.3, // negativo = mais caro que concorrentes
      top_selling_categories: ["Bebidas", "Laticínios", "Padaria"],
      underperforming_products: [
        { name: "Refrigerante Marca A 2L", margin: 8, target: 15 },
        { name: "Queijo Mussarela 500g", margin: 10, target: 18 },
        { name: "Pão Francês kg", margin: 12, target: 20 }
      ]
    };

    // Call Lovable AI (Gemini Flash - FREE até 06/10)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um analista especializado em supermercados brasileiros. 
Analise os dados fornecidos e gere 4-6 alertas acionáveis em português.
Cada alerta deve ter:
- title: título curto e impactante (max 60 caracteres)
- description: descrição clara da oportunidade ou problema (max 150 caracteres)
- priority: "high", "medium" ou "low"
- category: "margin", "rupture", "pricing" ou "opportunity"
- actionable_insight: insight específico e prático (max 200 caracteres)

Retorne APENAS um JSON válido no formato:
{
  "alerts": [
    {
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "category": "margin|rupture|pricing|opportunity",
      "actionable_insight": "string"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Analise estes dados e gere alertas inteligentes:

Empresa: ${businessData.company_name}
Faturamento Mensal: R$ ${businessData.monthly_revenue.toLocaleString('pt-BR')}
Margem Atual: ${businessData.current_margin}%
Meta de Margem: ${businessData.target_margin}%
Taxa de Ruptura: ${businessData.rupture_rate}%
Vantagem de Preço vs Concorrentes: ${businessData.competitor_price_advantage}%

Produtos com Margem Abaixo da Meta:
${businessData.underperforming_products.map(p => 
  `- ${p.name}: Margem ${p.margin}% (Meta: ${p.target}%)`
).join('\n')}

Categorias Top: ${businessData.top_selling_categories.join(', ')}

Gere alertas práticos e acionáveis com base nestes dados.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response:', aiContent);

    // Parse AI response (remove markdown code blocks if present)
    let alertsData;
    try {
      const cleanContent = aiContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      alertsData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI response');
    }

    // Add metadata
    const alerts = alertsData.alerts.map((alert: any, index: number) => ({
      ...alert,
      id: `alert_${Date.now()}_${index}`,
      generated_at: new Date().toISOString(),
      user_id: user.id
    }));

    console.log('Generated alerts:', alerts);

    return new Response(
      JSON.stringify({ alerts, business_data: businessData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating smart alerts:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
