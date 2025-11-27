import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Categorizing ticket:', { title, description });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are an AI that categorizes IT support tickets. Analyze the ticket content and return 2-4 relevant tags that describe the issue. 
            
Common tag categories:
- Technical: Hardware, Software, Network, Database, Security, Email, Printer, Access
- Facility: Room, Maintenance, Cleaning, Temperature, Furniture
- Academic: Course, Assignment, Grades, Registration, Library
- General: Password, Login, Account, Billing

Return ONLY a JSON object with a "tags" array. Example: {"tags": ["Hardware", "Network", "Urgent"]}`
          },
          {
            role: 'user',
            content: `Title: ${title}\nDescription: ${description}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Return default tags on error
      return new Response(
        JSON.stringify({ tags: ['Uncategorized'] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('AI response:', content);

    // Parse the JSON response
    const result = JSON.parse(content);
    
    return new Response(
      JSON.stringify({ tags: result.tags || ['Uncategorized'] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in categorize-ticket function:', error);
    
    // Return default tags on error
    return new Response(
      JSON.stringify({ tags: ['Uncategorized'] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
