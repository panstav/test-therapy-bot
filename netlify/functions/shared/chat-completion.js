const OpenAI = require("openai");
const Decimal = require('decimal.js');

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	organization: process.env.OPENAI_ORG,
	project: process.env.OPENAI_PROJECT,
});

const modelCosts = {
	'gpt-4o-2024-08-06': {
		input: 0.0000025,
		output: 0.00001
	},
	'gpt-3.5-turbo': {
		input: 0.000003,
		output: 0.000006
	},
	'gpt-3.5-turbo-0125': {
		input: 0.0000005,
		output: 0.0000015
	},
};

module.exports = async function completeChat(messages, { json, model = 'gpt-4o-2024-08-06', delayMs = 0 } = {}) {
	if (json) model = 'gpt-4o-2024-08-06';

	return new Promise(resolve => setTimeout(resolve, delayMs)).then(() => fetchChatCompletion().catch(err => {
		debugger;

		if ([502, 429].includes(err.status)) return completeChat(messages, { model, delayMs: (delayMs || 2000) * 2 });
		console.error(err);
		debugger;
	}));

	async function fetchChatCompletion() {

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

		const res = await openai.chat.completions.create(chatObj);

		if (!res) throw new Error('No response from OpenAI');

		const modelCost = modelCosts[res.model] || modelCosts['gpt-4o-2024-08-06'];
		res.cost = new Decimal(res.usage.completion_tokens).times(modelCost.output)
			.plus(new Decimal(res.usage.prompt_tokens).times(modelCost.input))
			.toNumber();

		return res;
	}

};