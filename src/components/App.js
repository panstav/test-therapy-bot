import { useState } from "react";

import Login from "./Login";
import Chat from "./Chat";

const isDevelopment = process.env.NODE_ENV === 'development';

export default function App () {

	const [userLoggedIn, setUserLoggedIn] = useState(isDevelopment);

	return <div style={{ position: "relative", height: "100%", maxWidth: '600px', margin: 'auto' }}>
		{userLoggedIn ? <Chat /> : <Login setUserLoggedIn={setUserLoggedIn} />}
	</div>;
}