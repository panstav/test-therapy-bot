export default async function fetchFunc(endpoint, data) {

	const fetchObj = {
		method: data ? 'POST' : 'GET',
	};

	if (data) {
		fetchObj.body = JSON.stringify(data);
		fetchObj.headers = {
			'Content-Type': 'application/json'
		};
	}

	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch(`/.netlify/functions/${endpoint}`, fetchObj);
			const data = response.json();
			resolve(data);

		} catch (error) {
			console.error(error);
			reject(error);
		}
	});

}