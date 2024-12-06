import Decimal from 'decimal.js';

export default async function netlifyFunc(endpoint, data) {

	let attempts = 0;

	const fetchObj = {
		method: data ? 'POST' : 'GET',
	};

	if (data) {
		fetchObj.body = JSON.stringify(data);
		fetchObj.headers = {
			'Content-Type': 'application/json'
		};
	}

	let res;
	try {
		res = await attemptFetching();
	} catch (error) {

	}

	if (res.cost) {
		window.totalCost = new Decimal(window.totalCost || 0).plus(res.cost).toNumber();
	}

	return res;

	async function attemptFetching() {
		let response, responseJson;

		try {
			if (attempts) await new Promise(resolve => setTimeout(resolve, 500));
			attempts++;
			response = await fetch(`/.netlify/functions/${endpoint}`, fetchObj);
			responseJson = await response.json();
			return responseJson;

		} catch (error) {
			if (error?.message.includes('TimeoutErr')) {
				return attemptFetching();
			}

			if (attempts < 3) {
				debugger;
				return attemptFetching();
			} else {
				throw error;
			}
		}
	}

}