export default async function netlifyFunc(endpoint, data) {

	const fetchObj = {
		method: data ? 'POST' : 'GET',
	};

	if (data) {
		fetchObj.body = JSON.stringify(data);
		fetchObj.headers = {
			'Content-Type': 'application/json'
		};
	}

	return attemptFetching();

	async function attemptFetching() {
		let response, responseJson;

		try {
			response = await fetch(`/.netlify/functions/${endpoint}`, fetchObj);
			responseJson = await response.json();
			return responseJson;

		} catch (error) {
			if (error?.message.includes('TimeoutErr')) {
				return attemptFetching();
			}

			debugger;
			throw error;
		}
	}

}