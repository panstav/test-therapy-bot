const OpenAI = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORG,
	project: process.env.OPENAI_PROJECT,
});

module.exports = async function completeChat(messages, { json, model = 'gpt-4o', delayMs = 0 } = {}) {
	if (json) model = 'gpt-4o-2024-08-06';

	return new Promise(resolve => setTimeout(resolve, delayMs)).then(() => fetchChatCompletion().catch(err => {
		debugger;

		if ([502, 429].includes(err.status)) return completeChat(messages, { model, delayMs: (delayMs || 2000) * 2 });
		console.error(err);
		debugger;
	}));

	function fetchChatCompletion() {

		const chatObj = {
			model,
			max_tokens: 1000,
			temperature: 0.5,
			messages
		};

		if (json) chatObj.response_format = {
			type: "json_schema",
			json_schema: json
		};

		return openai.chat.completions.create(chatObj);
	}

};