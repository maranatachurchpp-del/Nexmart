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
    let body = {};
    const contentLength = req.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > 0) {
      try {
        body = await req.json();
        requestSchema.parse(body);
      } catch (validationError) {
        console.error('Validation error:', validationError);
        return new Response(
          JSON.stringify({ error: 'Invalid request format' }),
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

    // Fetch REAL product data from database
    const { data: produtos, error: produtosError } = await supabaseClient
      .from('produtos')
      .select('*')
      .order('participacao_faturamento', { ascending: false })
      .limit(500);

    if (produtosError) {
      console.error('Error fetching products:', produtosError);
      throw new Error('Failed to fetch products');
    }

    // Fetch user profile for company name
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('company_name, name')
      .eq('user_id', user.id)
      .single();

    // Calculate real KPIs from product data
    const productCount = produtos?.length || 0;
    
    if (productCount === 0) {
      return new Response(
        JSON.stringify({ 
          alerts: [],
          business_data: { products_analyzed: 0 },
          message: 'No products found to analyze'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalRevenue = produtos.reduce((sum: number, p: any) => sum + (p.participacao_faturamento || 0) * 1000, 0);
    const avgMargin = produtos.reduce((sum: number, p: any) => sum + ((p.margem_a_min || 0) + (p.margem_a_max || 0)) / 2, 0) / productCount;
    const avgRuptura = produtos.reduce((sum: number, p: any) => sum + (p.ruptura_atual || 0), 0) / productCount;
    const avgQuebra = produtos.reduce((sum: number, p: any) => sum + (p.quebra_atual || 0), 0) / productCount;
    
    // Find underperforming products (margin below target)
    const underperforming = produtos
      .filter((p: any) => {
        const currentMargin = ((p.margem_a_min || 0) + (p.margem_a_max || 0)) / 2;
        const targetMargin = p.margem_a_min || 15;
        return currentMargin < targetMargin;
      })
      .slice(0, 5)
      .map((p: any) => ({
        name: p.descricao,
        margin: ((p.margem_a_min || 0) + (p.margem_a_max || 0)) / 2,
        target: p.margem_a_min || 15
      }));

    // Find products with high ruptura
    const highRuptura = produtos
      .filter((p: any) => (p.ruptura_atual || 0) > (p.ruptura_esperada || 0) * 1.2)
      .slice(0, 3);

    // Find products with high quebra
    const highQuebra = produtos
      .filter((p: any) => (p.quebra_atual || 0) > (p.quebra_esperada || 0) * 1.2)
      .slice(0, 3);

    // Get top categories by revenue
    const categoryRevenue = produtos.reduce((acc: Record<string, number>, p: any) => {
      const cat = p.departamento || 'Outros';
      acc[cat] = (acc[cat] || 0) + (p.participacao_faturamento || 0);
      return acc;
    }, {});
    
    const topCategories = Object.entries(categoryRevenue)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([name]) => name);

    // Build real business data
    const businessData = {
      company_name: profile?.company_name || profile?.name || "Sua Empresa",
      monthly_revenue: totalRevenue,
      target_margin: 18,
      current_margin: avgMargin,
      products_analyzed: productCount,
      rupture_rate: avgRuptura,
      quebra_rate: avgQuebra,
      top_selling_categories: topCategories,
      underperforming_products: underperforming,
      high_ruptura_products: highRuptura.map((p: any) => ({
        name: p.descricao,
        atual: p.ruptura_atual,
        esperada: p.ruptura_esperada
      })),
      high_quebra_products: highQuebra.map((p: any) => ({
        name: p.descricao,
        atual: p.quebra_atual,
        esperada: p.quebra_esperada
      }))
    };

    console.log('Business data calculated:', JSON.stringify(businessData, null, 2));

    // Call Lovable AI
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
Analise os dados REAIS fornecidos e gere 4-6 alertas acionáveis em português.
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
            content: `Analise estes dados REAIS do negócio e gere alertas inteligentes:

Empresa: ${businessData.company_name}
Faturamento Mensal Estimado: R$ ${businessData.monthly_revenue.toLocaleString('pt-BR')}
Margem Atual Média: ${businessData.current_margin.toFixed(1)}%
Meta de Margem: ${businessData.target_margin}%
Produtos Analisados: ${businessData.products_analyzed}
Taxa de Ruptura Média: ${businessData.rupture_rate.toFixed(1)}%
Taxa de Quebra Média: ${businessData.quebra_rate.toFixed(1)}%

Categorias Top por Faturamento: ${businessData.top_selling_categories.join(', ')}

${businessData.underperforming_products.length > 0 ? `
Produtos com Margem Abaixo da Meta:
${businessData.underperforming_products.map(p => 
  `- ${p.name}: Margem ${p.margin.toFixed(1)}% (Meta: ${p.target.toFixed(1)}%)`
).join('\n')}
` : ''}

${businessData.high_ruptura_products.length > 0 ? `
Produtos com Alta Ruptura:
${businessData.high_ruptura_products.map((p: any) => 
  `- ${p.name}: ${p.atual?.toFixed(1)}% (Esperado: ${p.esperada?.toFixed(1)}%)`
).join('\n')}
` : ''}

${businessData.high_quebra_products.length > 0 ? `
Produtos com Alta Quebra:
${businessData.high_quebra_products.map((p: any) => 
  `- ${p.name}: ${p.atual?.toFixed(1)}% (Esperado: ${p.esperada?.toFixed(1)}%)`
).join('\n')}
` : ''}

Gere alertas práticos e acionáveis baseados nestes dados reais.`
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
      JSON.stringify({ error: 'Unable to generate alerts' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
