const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

const isOpenRouterAvailable = () => Boolean(OPENROUTER_API_KEY && OPENROUTER_API_KEY.startsWith('sk-or-'));

/**
 * Send chat completion request to OpenRouter
 */
async function callOpenRouter({ messages, temperature = 0.4, max_tokens = 1000, model = DEFAULT_MODEL, response_format = null }) {
    if (!isOpenRouterAvailable()) {
        throw new Error('OPENROUTER_API_KEY is not configured in backend/.env');
    }

    const payload = {
        model,
        messages,
        temperature,
        max_tokens
    };

    if (response_format) {
        payload.response_format = response_format;
    }

    try {
        const response = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, payload, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://subshield.app',
                'X-Title': 'SubShield Financial Defense'
            },
            timeout: 25000
        });

        return response.data?.choices?.[0]?.message?.content || '';
    } catch (error) {
        const errDetail = error.response?.data?.error?.message || error.message;
        console.error('OpenRouter API request failed:', errDetail);
        throw new Error(errDetail);
    }
}

module.exports = {
    callOpenRouter,
    isOpenRouterAvailable,
    DEFAULT_MODEL
};

