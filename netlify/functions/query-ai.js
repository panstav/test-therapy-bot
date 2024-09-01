const queryAi = require("./shared/chat-completion");

exports.handler = async function (event) {

	const messages = JSON.parse(event.body);

	const aiResponse = await queryAi(messages);

	return {
		statusCode: 200,
		body: JSON.stringify({ message: aiResponse.choices[0].message.content })
	};
};