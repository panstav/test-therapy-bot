const OpenAI = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORG,
	project: process.env.OPENAI_PROJECT,
});

module.exports = chatCompletion;

function chatCompletion(messages, { delayMs = 0 } = {}) {
	debugger;
	return new Promise(resolve => setTimeout(resolve, delayMs)).then(() => fetchPrediction().catch(err => {
		debugger;

		if ([502, 429].includes(err.status)) return chatCompletion(messages, { delayMs: (delayMs || 2000) * 2 });
		console.error(err);
		debugger;
	}));

	function fetchPrediction() {
		return openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			max_tokens: 300,
			temperature: 0.5,
			messages
		});
	}

}