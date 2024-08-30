import { useRef } from "react";

export default function Login({ setUserLoggedIn }) {

	const passwordRef = useRef();

	const attemptLogin = async () => {

		const password = passwordRef.current.value.trim();

		if (!password) {
			alert('נא להזין סיסמה');
			return;
		}

		const response = await fetch('/.netlify/functions/login', {
			method: 'POST',
			body: JSON.stringify({ password }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const { isCorrect } = await response.json();

		if (isCorrect) {
			setUserLoggedIn(true);
		} else {
			alert('סיסמה שגויה');
		}

	};

	return <div className="pt-6 mx-auto" style={{ maxWidth: '300px' }}>
		<h1 className="title is-3 has-text-black has-text-centered mb-5">התחברות</h1>
		<input ref={passwordRef} id="password" type="password" placeholder="סיסמה" className="input has-text-black has-background-white has-text-centered" />
		<button onClick={attemptLogin} className="button is-primary mt-3" style={{ width: '100%' }}>התחברות</button>
	</div>;

}