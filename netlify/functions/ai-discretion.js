const chatCompletion = require("./shared/chat-completion");

exports.handler = async function (event) {

	const { qna } = JSON.parse(event.body);

	const aiResponse = await chatCompletion([
		{ role: 'system', content: getSystemMessage() },
		{ role: 'user', content: qna }
	], { model: 'gpt-3.5-turbo' });

	const results = {
		a: 'discovery',
		b: 'bestQuestion',
		c: 'bestQuestionWithDoubt'
	};

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: results[aiResponse.choices[0].message.content] || 'discovery',
			cost: aiResponse.cost
		})
	};
};

function getSystemMessage() {
	return `You are a self-enquiry guide, your job is to determine the right course of action for a self-enquiry. The user will provide a question and answer pair, and you will reply exactly with one of the following: [a, b, c].

	If the answer is a direct response to the question, is a coherent answer - reply with b.
	If the answer is a direct response to the question, is a coherent answer that demonstrates a strong self-reflection - reply with c.
	If the answer is not a directly responsding to the question, or is not coherent or does not demonstrate a strong self-reflection - reply with a.`
}