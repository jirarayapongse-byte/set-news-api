const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function summarizeThaiArticle({ title, body, maxChars = 180 }) {
  const text = [title, body].filter(Boolean).join('\n');
  if (!text) return '';

  if (!openai) {
    // Fallback: return truncated body
    return body && body.length > maxChars ? body.slice(0, maxChars - 1) + '…' : (body || title || '');
  }

  const prompt = `สรุปใจความสำคัญให้สั้น กระชับ และเป็นประโยคเดียว (${maxChars} ตัวอักษร):\n\n${text}`;

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes financial articles in Thai.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 200,
  });

  const summary = resp.choices?.[0]?.message?.content?.trim();
  return summary || (body || title || '');
}

module.exports = { summarizeThaiArticle };