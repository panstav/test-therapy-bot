const chatCompletion = require("./shared/chat-completion");

exports.handler = async function (event) {

	const { qna } = JSON.parse(event.body);

	const aiResponse = await chatCompletion([
		{ role: 'system', content: getSystemMessage() },
		{ role: 'user', content: qna }
	], {
		json: {
			"name": "rate_briefness",
			"description": "Rate the briefness level of the answer",
			"strict": true,
			"schema": {
				"type": "object",
				"properties": {
					"rate": {
						"type": "number",
						"description": "The briefness level of the answer, 0 (low) to 10 (high)"
					}
				},
				"additionalProperties": false,
				"required": [
					"rate"
				]
			}
		}
	});

	let briefnessLevel;
	try {
		briefnessLevel = JSON.parse(aiResponse.choices[0].message.content).rate;
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({ message: error?.message || 'Internal error' })
		};

	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: briefnessLevel,
			cost: aiResponse.cost
		})
	};
};

function getSystemMessage() {
	return `You are a briefness monitor, it's better when the user answer all the questions and thoroughly so, your role is to rate the level of briefname on a 0 to 10 scale, make sure you don't confuse briefness with the user not understanding the question. You will receive a question and answer pair, and you will rate the briefness level of the answer.

	Example:

	Q: How are you?
	A: I am feeling very sad because I lost my job yesterday, it was my fault - I was late for work and my boss fired me
	Rate: 0

	Q: Is this pattern of behavior common for you?
	A: What do you mean?
	Rate: 0

	Q: How are you?
	A: I'm worthless
	Rate: 5

	Q: How are you?
	A: I'm fine
	Rate: 9

	Q: How are you?
	A: nah
	Rate: 10
	`;
}