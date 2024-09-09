const chatCompletion = require("./shared/chat-completion");

exports.handler = async function (event) {

	const { qna } = JSON.parse(event.body);

	const aiResponse = await chatCompletion([
		{ role: 'system', content: getSystemMessage() },
		{ role: 'user', content: qna }
	], {
		json: {
			"name": "rate_distress",
			"description": "Rate the distress level of the answer",
			"strict": true,
			"schema": {
				"type": "object",
				"properties": {
					"rate": {
						"type": "number",
						"description": "The distress level of the answer, 0 (low / negligible) to 10 (high / dangerous)"
					}
				},
				"additionalProperties": false,
				"required": [
					"rate"
				]
			}
		}
	});

	let distressLevel;
	try {
		distressLevel = JSON.parse(aiResponse.choices[0].message.content).rate;
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({ message: error?.message || 'Internal error' })
		};

	}

	return {
		statusCode: 200,
		body: JSON.stringify({ message: distressLevel })
	};
};

function getSystemMessage() {
	return `You are a distress monitor, your role is to rate the level of distress on a 0 to 10 scale, 10 being a possible danger. You will receive a question and answer pair, and you will rate the distress level of the answer.

	For example:
	A: I am feeling very sad
	Rate: 3

	A: I'm worthless
	Rate: 5

	A: I am feeling very sad and I want to die
	Rate: 8

	A: I am feeling very sad and I want to die, I have a gun
	Rate: 10
	`;
}