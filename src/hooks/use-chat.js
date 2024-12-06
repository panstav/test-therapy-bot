import { Fragment, useEffect, useState } from "react";
import { Message } from "@chatscope/chat-ui-kit-react";
import * as Sentry from "@sentry/react";
import classNames from "classnames";

import netlifyFunc from "../lib/netlify-func";

const isDevelopment = process.env.NODE_ENV === 'development';

export default function useChat() {

	const [status, setStatus] = useState(true);

	const [messages, setMessages] = useState([]);
	const lastMessage = messages[messages.length - 1] || {};

	const [isBotTyping, setIsBotTyping] = useState(false);

	const [explainedLengthiness, setExplainedLengthiness] = useState(false);

	const [disclosedDistressLevel, setDistressLevel] = useState(null);
	const [disclosedEnquiryWillingness, setEnquiryWillingness] = useState(null);

	const [discoveryCounter, setDiscoveryCounter] = useState(0);
	const countDiscovery = () => setDiscoveryCounter(discoveryCounter + 1);

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

	const executeUserMessage = async (message, tempData) => {
		const messagesInclUserMessage = [...messages, { message, direction: 'outgoing' }];
		setMessages(messagesInclUserMessage);

		clearTimeout(timer);
		setTimer(null);

		const nextBotMessageKey = await (async () => {
			let key;

			if (!lastMessage?.options) {
				// detect distress levels
				if (!disclosedDistressLevel && !tempData?.distressLevel) {
					const distressLevel = await runFunc('ai-detect-distress',
					{ qna: messagesInclUserMessage.slice(-2).reduce((accu, message) => {
								if (message.direction === 'incoming') accu += `Q: ${message.message}\n`;
								else accu += `A: ${message.message}\n`;
								return accu;
					}, '') }
					).then(({ message }) => parseFloat(message) || 0);
					// console.log('Detected distressLevel', distressLevel);
					if (distressLevel >= 6) return 'rateDistress';
				}

				if (messages.length > 2 && (!explainedLengthiness || messages.length - explainedLengthiness >= 4) && !tempData?.distressLevel) {
					const briefness = await runFunc('ai-detect-briefness',
					{ qna: messagesInclUserMessage.slice(-2).reduce((accu, message) => {
								if (message.direction === 'incoming') accu += `Q: ${message.message}\n`;
								else accu += `A: ${message.message}\n`;
								return accu;
					}, '') }
					).then(({ message }) => parseFloat(message) || 0);
					console.log('Detected briefness', briefness);
					if (briefness >= 7) {
						setExplainedLengthiness(messages.length);
						return 'explainLengthiness';
					}
				}

				if (!disclosedEnquiryWillingness && messages.length > 3 && !tempData?.distressLevel) {
					const enquiryOpportunity = await runFunc('ai-detect-enquiry',
					{ qna: messagesInclUserMessage.slice(-2).reduce((accu, message) => {
								if (message.direction === 'incoming') accu += `Q: ${message.message}\n`;
								else accu += `A: ${message.message}\n`;
								return accu;
					}, '') }
					).then(({ message }) => parseFloat(message) || 0);
					// console.log('Detected enquiryOpportunity', enquiryOpportunity);
					if (enquiryOpportunity >= 7) {
						setEnquiryWillingness(true);
						return 'suggestEnquiry';
					}
				}
			}

			if (lastMessage.next) key = lastMessage.next();
			else key = lastMessage.options.find((option) => option.label === message).next();

			if (key !== 'discretion') return key;

			return runFunc('ai-discretion', {
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
	const chooseUserMessage = (event, tempData) => executeUserMessage(event.currentTarget.innerText, tempData);

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
			message: getDiscoveryQuestion,
			beforeUserReplyCallback: countDiscovery,
			next: () => discoveryCounter >= 2 ? 'discretion' : 'discovery'
		},
		bestQuestion: {
			type: 'open-question',
			message: getBestQuestion,
			next: () => 'discretion'
		},
		bestQuestionWithDoubt: {
			type: 'open-question',
			message: ({ messages }) => getBestQuestion({ messages, readyForDoubt: true }),
			next: () => 'discovery'
		},
		explainLengthiness: {
			type: 'open-question',
			message: explainLengthiness,
			next: () => 'discretion'
		},
		rateDistress: {
			type: 'choice',
			message: 'מהי רמת המצוקה הנוכחית שלך?',
			options: Array.from({ length: 7 }, (_, index) => ({
				label: index + 1 === 1 ? '1 (נמוך)' : index + 1 === 7 ? '7 (גבוה מאוד)' : String(index + 1),
				next: index + 1 >= 6 ? () => 'distress' : () => 'discretion',
				onClick: (event) => {
					const distressLevel = parseInt(event.currentTarget.innerText);
					setDistressLevel(distressLevel);
					return { distressLevel };
				}
			}))
		},
		distress: {
			type: 'choice',
			message: 'איך היית רוצה לטפל במצוקה שלך?',
			options: [
				{ label: 'להתקשר למשטרה', href: 'tel:100' },
				{ label: 'להתקשר למד"א', href: 'tel:101' },
				{ label: 'להתקשר לער"ן', href: 'tel:*2201' },
				{ label: 'להתקשר למרכז תקיפה מינית', href: 'tel:1202' },
				{ label: 'להתקשר למרכז סיוע לאלימות במשפחה', href: 'tel:1-800-220-000' }
			].map((option) => ({
				...option,
				next: () => 'shouldWeContinue'
			}))
		},
		suggestEnquiry: {
			type: 'choice',
			message: 'האם היית רוצה לחקור עוד על הנושא?',
			options: [
				{ label: 'כן', next: () => 'bestQuestionWithDoubt'},
				{ label: 'לא', next: () => 'discovery'}
			]
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
		status,
		userInputType: lastMessage.type,
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
					{message.options.map(({ label, href, onClick = () => {} }) => {
						const OuterWrapper = href ? 'div' : Fragment;
						const ItemWrapper = href ? 'a' : 'div';
						const wrapperProps = href ? { className: "box is-clickable" } : {};
						const itemProps = {};
						if (href) {
							itemProps.href = href;
							itemProps.target = '_blank';
							itemProps.rel = 'noopener noreferrer';
						}
						itemProps.onClick = (event) => {
							const tempData = onClick(event);
							chooseUserMessage(event, tempData);
						};
						const itemClassName = classNames('py-2 has-text-centered', href || 'box is-clickable');
						return <OuterWrapper key={label} {...wrapperProps}>
							<ItemWrapper key={label} className={itemClassName} {...itemProps}>{label}</ItemWrapper>
						</OuterWrapper>;
					})}
				</div>}
			</Message.CustomContent>
		}))
	};

}

async function runFunc(funcName, payload) {

	let res;
	try {
		res = await netlifyFunc(funcName, payload);
	} catch (error) {
		debugger;
		if (!isDevelopment) Sentry.captureException(error);
		return alert('שגיאת מערכת. שלחתי למערכת דו"ח של השגיאה והיא תטופל בהקדם. בינתיים - אפשר להתחיל את השיחה מחדש..');
	}
	return res;
}

function explainLengthiness({ messages }) {
	return runFunc('ai-explain-lengthiness', {
		messages: prepMessagesForAi(messages.slice(-2))
	});
}

function getDiscoveryQuestion({ messages }) {
	return runFunc('ai-discovery', {
		messages: prepMessagesForAi(messages)
	});
}

function getBestQuestion({ messages, readyForDoubt }) {
	return runFunc('ai-best-question', {
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