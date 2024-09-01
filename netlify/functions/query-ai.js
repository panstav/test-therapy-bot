const chatCompletion = require("./shared/chat-completion");

exports.handler = async function (event) {

	const messages = JSON.parse(event.body);

	const aiResponse = await chatCompletion(messages);

	return {
		statusCode: 200,
		body: JSON.stringify({ message: aiResponse.choices[0].message.content })
	};
};