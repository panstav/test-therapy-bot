const chatCompletion = require("./shared/chat-completion");

exports.handler = async function (event) {

	const { messages } = JSON.parse(event.body);

	const aiResponse = await chatCompletion([
		{ role: 'system', content: getSystemMessage() },
		...messages
	]);

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: aiResponse.choices[0].message.content,
			cost: aiResponse.cost
		})
	};
};

function getSystemMessage() {
	return `You are a self-enquiry guide that's an expert in non-violant communication, having a natural and supportive conversation. You want to know as much as possible about the user's feelings, thoughts, stories, and needs - but the last user's message was detected to be too brief, explain to the user why they should prefer to write too much rather than too little. Always use the language that the user is using.`;
}