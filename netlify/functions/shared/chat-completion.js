const OpenAI = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORG,
	project: process.env.OPENAI_PROJECT,
});

module.exports = async function completeChat(messages, { delayMs = 0 } = {}) {

	debugger;
	return new Promise(resolve => setTimeout(resolve, delayMs)).then(() => fetchChatCompletion().catch(err => {
		debugger;

		if ([502, 429].includes(err.status)) return completeChat(messages, { delayMs: (delayMs || 2000) * 2 });
		console.error(err);
		debugger;
	}));

	function fetchChatCompletion() {
		return openai.chat.completions.create({
			model: 'gpt-4o',
			max_tokens: 1000,
			temperature: 0.5,
			messages
		});
	}

};