exports.handler = async function (event) {

	const { password } = JSON.parse(event.body);

	return {
		statusCode: 200,
		body: JSON.stringify({ isCorrect: password === process.env.PASSWORD })
	};
}