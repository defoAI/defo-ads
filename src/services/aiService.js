// File: src/services/aiService.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const parseAiResponse = (response) => {
    try {
        // 1. Try to parse directly
        return JSON.parse(response);
    } catch (e) {
        // 2. Try to extract JSON code block
        const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (e2) {
                // context-specific error handling later
            }
        }

        // 3. Try to find first { and last }
        const firstOpen = response.indexOf('{');
        const lastClose = response.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            try {
                return JSON.parse(response.substring(firstOpen, lastClose + 1));
            } catch (e3) {
                // fall through
            }
        }

        throw new Error('Failed to parse JSON from AI response');
    }
};

const interpolate = (template, data) => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
};

/**
 * Basic wrapper for OpenAI Chat Completion
 */
export const generateCompletion = async (systemPrompt, userPrompt) => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        throw new Error('OpenAI API Key not configured. Please go to Settings.');
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Defaulting to 4o as per context, or gpt-4-turbo
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API Error');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};

/**
 * Generates Google Ads copy based on Campaign, Ad Group, and Site Context
 * @param {Object} campaign - Campaign details
 * @param {Object} adGroup - Ad Group details
 * @param {Object} site - Site configuration (optional)
 * @param {Array} keywords - List of keywords in the Ad Group
 */
export const generateAdCopy = async (campaign, adGroup, site, keywords) => {
    let systemPrompt = `You are a world-class Google Ads copywriter. Create high-performing, relevance-optimized text ads.
Output format should be JSON with fields: 'Headline 1', 'Headline 2', 'Headline 3', 'Description 1', 'Description 2'.
Constraints:
- Headlines: Max 30 chars
- Descriptions: Max 90 chars
- Tone: Professional, persuasive, action-oriented.`;

    if (site) {
        systemPrompt += `\n\nGlobal Site Context:
Name: ${site.name}
URL: ${site.url}
Description: ${site.description || 'N/A'}
SEO Keywords: ${site.seoKeywords || 'N/A'}`;
    }

    const keywordList = keywords.map(k => k.Keyword).join(', ');
    const userPrompt = `Generate a text ad for:
Campaign: ${campaign.Campaign}
Ad Group: ${adGroup['Ad Group']}
Keywords: ${keywordList}

Focus on the unique value proposition derived from the Site Context if available.`;

    return generateCompletion(systemPrompt, userPrompt);
};

/**
 * Generic Generation from a Store Prompt Template
 * @param {Object} promptTemplate - The prompt object from store
 * @param {Object} contextData - Key-value pairs for placeholders
 */
export const generateFromPrompt = async (promptTemplate, contextData) => {
    if (!promptTemplate || !promptTemplate.template) {
        throw new Error('Invalid prompt template');
    }

    // Interpolate placeholders
    // We assume the whole template is the system prompt context, 
    // or we can split it. For simplicity, we send the interpolated template as System,
    // and rely on specific user instructions if needed, or just one big prompt.
    //
    // Best practice for these custom prompts: The template is the "System" or "Base" instruction.
    // We can also have a "User" part if needed, but often one big prompt works for GPT-4.

    const content = interpolate(promptTemplate.template, contextData);

    // For now, we send it as a User message to ensure it's followed as an instruction immediately,
    // or split it. Let's try System + User architecture if the template implies it.
    // Actually, simple 1-shot: System = "You are a helpful AI.", User = content.

    return generateCompletion("You are a helpful AI assistant for Google Ads.", content);
};
