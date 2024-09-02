import { useEffect, useState } from "react";
import { Message } from "@chatscope/chat-ui-kit-react";

import fetchFunc from "../lib/fetch-func";

export default function useChat() {

	const [status, setStatus] = useState(true);

	const [messages, setMessages] = useState([]);
	const lastMessage = messages[messages.length - 1] || {};

	const [isBotTyping, setIsBotTyping] = useState(false);

	const [questionsCount, setQuestionsCount] = useState(0);
	const countQuestions = () => setQuestionsCount(questionsCount + 1);

	const executeUserMessage = async (message) => {
		const messagesInclUserMessage = [...messages, { message, direction: 'outgoing' }];
		setMessages(messagesInclUserMessage);

		const nextBotMessageKey = await (() => {
			if (lastMessage.next) return lastMessage.next();
			return lastMessage.options.find((option) => option.label === message).next();
		})();

		setIsBotTyping(true);
		setTimeout(() => {
			setIsBotTyping(false);
			executeBotMessage(messageTypes[nextBotMessageKey], messagesInclUserMessage);
		}, (Math.random() * 1000 + 1000));
	};
	const chooseUserMessage = (event) => executeUserMessage(event.currentTarget.innerText);

	const executeBotMessage = async (messageType, messages) => {

		if (typeof messageType.message === 'function') messageType.message = (await messageType.message({ messages })).message;

		setMessages((messages) => [...messages, { direction: 'incoming', ...messageType }]);
		if (messageType.beforeUserReplyCallback) await (messageType.beforeUserReplyCallback || Promise.resolve)();
	};

	const messageTypes = {
		initial: {
			type: 'choice',
			message: 'שלום, מה שלומך? במה אוכל לעזור?',
			next: () => 'bestQuestion',
		},
		bestQuestion: {
			type: 'open-question',
			message: ({ messages }) => getBestQuestion(messages),
			beforeUserReplyCallback: countQuestions,
			next: () => (questionsCount >= 30 && onceIn(5, 10)) ? 'shouldWeContinue' : 'bestQuestion'
		},
		shouldWeContinue: {
			type: 'choice',
			message: 'שניקח הפסקה?',
			options: ['כן', 'לא'].map((state) => ({
				label: state,
				next: () => state === 'כן' ? 'end' : 'bestQuestion'
			})),
		},
		end: {
			type: null,
			beforeUserReplyCallback: () => setStatus(false),
			message: 'תודה רבה על השיחה. אני כאן בשבילך בכל עת.'
		}
	};

	useEffect(() => {
		if (!messages.length) executeBotMessage(messageTypes.initial, []);
	}, [!messages.length]);

	return {
		status: status && lastMessage.type === 'open-question',
		isBotTyping,
		reply: executeUserMessage,
		messages: messages.map((message, index, arr) => ({
			direction: message.direction,
			type: 'custom',
			payload: <Message.CustomContent>
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

function getBestQuestion(messages) {
	return fetchFunc('query-ai', [
		{
			role: 'system', content: `You are a self-enquiry guide that's an expert in non-violant communication. Choose the most fitting single question out of the following set, rephrase it to naturally fit the conversation, and translate it to the user's language:

			האם אתה מרגיש בנוח להתחיל ברור לגבי הנושא עבורו פנית?
תוכל שתף אותי מה שלומך כעת?
רוצה לשתף אותי ברגשות שאתה חווה עכשיו?
מרגיש שהרבה מאוד צרכים שלך לא נענים, רוצה לפרט אותם?
מרגיש מאוד לא נעים, נכון?
בין 1-7 מה רמת המצוקה כרגע?
הרגשות הללו חוזרים על עצמם שוב ושוב?
מבין שהמון רגשות לא נעימים ולא נוחים מציפים אותך?
אתה יכול לעצור ולנשום רגע?
עדין רוצה להעמיק עוד בתהליך ברור הנושא?
את יכול לחשוב על דפוס פעולה שאתה תמיד חוזרת עליו, כשזה קורה לך?
האם תסכים לשתף אותי בדפוס פעולה או מחשבה זה?
ישנה אפשרות שחווית בעבר התנהגות דומה כזאת, מאחד מהוריך או מישהו בסביבתך?
מתאים לך שנעצור רגע לנשום עמוק?
מה דעתך, אולי המציאות מנסה לשדר לך דרך התחושות האלו, מעכשיו והעבר, משהוא שיש לשים אליו לב?
מסכים לשתף מה עובר בך עכשיו?
האם יש איזה מסר פנימי שאתה מרגיש שמנסה להתבהר לך?
לאור התובנה הזו, האם ישנה אפשרות שהאנשים או הסיטואציה ישתנו?
האם ישנה אפשרות עבורך לשנות את דרך פעולתך?
מה זה אומר לעשות אחרת מי מה שאתה רגיל?
אתה יכול שוב לעצור ולנשום רגע?
הייתה רוצה שהמציאות תהיה אחרת?
מסכים לשתף במציאות שהייתה רוצה?
מוכן לכתוב מה יקרה אם המציאות הזו תהיה כמו שאתה רוצה?
אולי המציאות לא יכולה להיות אחרת?
בין 1-7 איך אתה מרגיש עכשיו?
האם ישנה אפשרות שמה שאתה חווה כרגע איננה האמת?
האם ישנה אפשרות שאתה מורגל לחשוב בדרך מסויימת, שאינה משקפת עבורך את האמת שמייטיבה איתך?
האם ישנה אפשרות שלמעשה האמת היא בדיוק הפוך מי מה שאתה מרגיש כעת?
האדם או המצב הנ"ל גורמים לך לאי נוחות, נכון?
האם מסקרן אותך להבין מה זה זה אומר - בדיוק הפוך?
האם מהשאלות האחרונות אתה חש שיש כאן מקום ללמידה חדשה?
האם מסקרן אותך עכשיו להבין מה המציאות מנסה להגיד לך?
האם ייתכן שהמציאות נתונה לפרשנות?
האם השאלה האחרונה הטילה צל של ספק באמת שלך?
האם הייתה רוצה שמצב המחשבה הנוכחי ישתנה לטובתך?
האם תוכל לדמיין לך את חייך ללא מחשבה זו?
האם יתכן שהמצב או האדם הזה זה למעשה זה אתה אשר מקשה ומכאיב לעצמך?
האם יתכן שאתה צריך להקשיב לעצמך ולא למצב או לאדם שמולך?
האם יתכן שאתה לא מקשיב לעצמך מספיק?
האם ייתכן שאיזו אמונה / מחשבה שחוסמת אותך בקשר למצב או האדם שמולך?
האם יתכן שלמעשה אתה הוא זה הפוגע בעצמך?
תסכים לדרג איך אתה מרגיש עכשיו?
האם תסכים לעצום את העיניים ולנשום 5 נשימות עמוקות?
האם אתה מרגיש עכשיו יותר טוב?
אם אכן המציאות היא שונה ממי מה שחשבת עד כה, מוכן לנסות לחשוב עליה בהפוך על הפוך?
אם אכן המציאות היא שונה ממי מה שחשבת עד כה, תוכל לכתוב פה את ההפך מי מה שחשבת עד עכשיו?
רוצה לשתף מה אתה מרגיש כעת?
תוכל כעת לתת לעצמך חמלה ואמפתיה?
תוכל לברר עם עצמך מה הרגשות והצרכים שלך כרגע?` },
		...messages.map((message) => ({ role: message.direction === 'incoming' ? 'assistant' : 'user', content: message.message }))
	]);
}

function isRtl(text) {
	if (typeof text !== 'string') debugger;
	if (!text) return false;
	return (text.match(/[\u0590-\u05FF\u0600-\u06FF]/g) || []).length > 0;
}