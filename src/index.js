import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";

import App from 'App';

if (process.env.NODE_ENV === 'production') {
	Sentry.init({
		dsn: "https://958bf8bbdf24baacb20ddafbdd4fd326@o4507886788804608.ingest.de.sentry.io/4507886792867920",
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration(),
		],
		// Tracing
		tracesSampleRate: 1.0, //  Capture 100% of the transactions
		// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
		tracePropagationTargets: ["localhost", /^https:\/\/thera-demo\.netlify\.app\/\.netlify\/functions\/.+/],
		// Session Replay
		replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
		replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
	});
}

// run app
createRoot(document.getElementById('app'))
	.render(<App/>);