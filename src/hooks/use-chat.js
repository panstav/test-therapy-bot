import { useEffect, useState } from "react";
import { Message } from "@chatscope/chat-ui-kit-react";

import netlifyFunc from "../lib/netlify-func";

const isDevelopment = process.env.NODE_ENV === 'development';

export default function useChat() {

	const [status, setStatus] = useState(true);

	const [messages, setMessages] = useState([]);
	const lastMessage = messages[messages.length - 1] || {};

	const [isBotTyping, setIsBotTyping] = useState(false);

	const [discoveryCounter, setDiscoveryCounter] = useState(0);
	const countDiscovery = () => setDiscoveryCounter(discoveryCounter + 1);
	const [questionsCount, setQuestionsCount] = useState(0);
	const countQuestions = () => setQuestionsCount(questionsCount + 1);

	const [timer, setTimer] = useState();

	const setupTimeout = (lastMessageName) => {
		const newTimer = setTimeout(() => {
			if (lastMessageName === 'shouldWeContinue') return executeBotMessage(messageTypes.end, 'end');
			executeBotMessage(messageTypes.shouldWeContinue, 'shouldWeContinue');
		}, 1000 * 60 * 10);
		setTimer(newTimer);
	};

	const onUserTyping = () => {
		clearTimeout(timer);
		setupTimeout();
	};

	const executeUserMessage = async (message) => {
		const messagesInclUserMessage = [...messages, { message, direction: 'outgoing' }];
		setMessages(messagesInclUserMessage);

		clearTimeout(timer);
		setTimer(null);

		const nextBotMessageKey = await (() => {
			let key;
			if (lastMessage.next) key = lastMessage.next();
			else key = lastMessage.options.find((option) => option.label === message).next();

			if (key !== 'discretion') return key;

			return netlifyFunc('ai-discretion', {
				qna: messages.slice(-2).reduce((accu, message) => {
					if (message.direction === 'incoming') accu += `Q: ${message.message}\n`;
					else accu += `A: ${message.message}\n`;
					return accu;
				}, '')
			}).then(({ message }) => ['discovery', 'bestQuestion', 'bestQuestionWithDoubt'].includes(message) ? message : 'discovery');
		})();

		setIsBotTyping(true);
		setTimeout(() => {
			executeBotMessage(messageTypes[nextBotMessageKey], nextBotMessageKey, messagesInclUserMessage);
		}, (Math.random() * 1000 + 1000));
	};
	const chooseUserMessage = (event) => executeUserMessage(event.currentTarget.innerText);

	const executeBotMessage = async (messageType, messageTypeName, messages) => {

		if (typeof messageType.message === 'function') messageType.message = (await messageType.message({ messages })).message;

		setIsBotTyping(false);
		setMessages((messages) => [...messages, { direction: 'incoming', ...messageType, name: messageTypeName }]);
		if (messageType.beforeUserReplyCallback) await (messageType.beforeUserReplyCallback || Promise.resolve)();
	};

	const messageTypes = {
		initial: {
			type: 'open-question',
			message: 'שלום, מה שלומך? במה אוכל לעזור?',
			next: () => 'discovery'
		},
		discovery: {
			type: 'open-question',
			message: ({ messages }) => getDiscoveryQuestion({ messages }),
			beforeUserReplyCallback: countDiscovery,
			next: () => discoveryCounter >= 2 ? 'discretion' : 'discovery'
		},
		bestQuestion: {
			type: 'open-question',
			message: ({ messages }) => getBestQuestion({ messages }),
			next: () => 'discretion'
		},
		bestQuestionWithDoubt: {
			type: 'open-question',
			message: ({ messages }) => getBestQuestion({ messages, readyForDoubt: true }),
			next: () => 'discovery'
		},
		shouldWeContinue: {
			type: 'choice',
			message: 'שניקח הפסקה?',
			beforeUserReplyCallback: () => setupTimeout('shouldWeContinue'),
			options: ['כן', 'לא'].map((state) => ({
				label: state,
				next: () => state === 'כן' ? 'end' : 'discretion'
			})),
		},
		end: {
			type: null,
			beforeUserReplyCallback: () => setStatus(false),
			message: 'תודה רבה על השיחה. אני כאן בשבילך בכל עת.'
		}
	};

	useEffect(() => {
		if (!messages.length) executeBotMessage(messageTypes.initial, 'initial', []);
	}, [!messages.length]);

	useEffect(() => {
		if (!status || !messages.length || timer || isDevelopment) return;
		setupTimeout();
	}, [messages.length, lastMessage.name, status, timer]);

	return {
		onUserTyping,
		status: status && lastMessage.type === 'open-question',
		isBotTyping,
		reply: executeUserMessage,
		messages: messages.map((message, index, arr) => ({
			name: message.name,
			direction: message.direction,
			type: 'custom',
			payload: <Message.CustomContent>
				{(isDevelopment && message.direction === 'incoming') && <pre className="has-text-weight-bold is-inline-block mb-1 p-1" style={{ backgroundColor: 'transparent' }}>{message.name}</pre>}
				<div className={isRtl(message?.message) ? 'is-rtl' : ''}>{message.message}</div>
				{message.type === 'choice' && index === arr.length - 1 && <div className="boxes mt-3">
					{message.options.map((option) => <div key={option.label} className="box is-clickable py-2 has-text-centered" onClick={chooseUserMessage}>{option.label}</div>)}
				</div>}
			</Message.CustomContent>
		}))
	};

}

function onceIn(min, max) {
	return Math.random() < 1 / (min + Math.random() * (max - min));
}

function getDiscoveryQuestion({ messages }) {
	return netlifyFunc('ai-discovery', {
		messages: prepMessagesForAi(messages)
	});
}

function getBestQuestion({ messages, readyForDoubt }) {
	return netlifyFunc('ai-best-question', {
		readyForDoubt,
		messages: prepMessagesForAi(messages)
	});
}

function prepMessagesForAi(messages) {
	return messages.map((message) => ({ role: message.direction === 'incoming' ? 'assistant' : 'user', content: message.message }));
}

function isRtl(text) {
	if (typeof text !== 'string') debugger;
	if (!text) return false;
	return (text.match(/[\u0590-\u05FF\u0600-\u06FF]/g) || []).length > 0;
}