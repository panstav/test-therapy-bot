const chatCompletion = require("./shared/chat-completion");

exports.handler = async function (event) {

	const { qna } = JSON.parse(event.body);

	const aiResponse = await chatCompletion([
		{ role: 'system', content: getSystemMessage() },
		{ role: 'user', content: qna }
	], {
		json: {
			"name": "rate_enquiry_opportunity",
			"description": "Rate the opportunity level to enquire the user about an issue",
			"strict": true,
			"schema": {
				"type": "object",
				"properties": {
					"rate": {
						"type": "number",
						"description": "The opportunity level, 0 (low) to 10 (high)"
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
		body: JSON.stringify({
			message: distressLevel,
			cost: aiResponse.cost
		})
	};
};

function getSystemMessage() {
	return `You are an enquiry monitor, your role is to rate the level of opportunity to investigate an important issue on a 0 to 10 scale, 10 being a bold opportunity. User will share a Q&A thread, and you will rate the opportunity level of the user's answer.

	For example:
	A: I don't like it
	Rate: 1

	A: This situation is hard for me
	Rate: 2

	A: I'm feeling lost
	Rate: 3

	A: I'm still considering what to do, we'll see
	Rate: 5

	A: I'm not sure what to do, it's hard to decide
	Rate: 7

	A: There's something I'm strongly conflicted about
	Rate: 10
	`;
}