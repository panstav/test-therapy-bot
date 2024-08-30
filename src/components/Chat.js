import { useState } from "react";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, ConversationHeader, Avatar, TypingIndicator } from "@chatscope/chat-ui-kit-react";

export default function Chat() {

	const [inputClassName, setInputClassName] = useState('');

	const [messages, setMessages] = useState([
		{ message: 'שלום' },
		{ message: 'שלום! איך אני יכול לעזור לך היום?', direction: 'incoming' }
	]);
	const addMessage = (message, options = {}) => {
		setInputClassName();
		setMessages((messages) => [...messages, { message, ...options }]);
	};

	const [isTyping, setTyping] = useState(false);

	const sendMessage = async (message) => {
		addMessage(message);

		const timer = setTimeout(() => setTyping(true), (Math.random() * 500) + 500);

		try {
			const response = await fetch('/.netlify/functions/message-ai', {
				method: 'POST',
				body: JSON.stringify(messages.concat({ message })),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();

			setTimeout(() => {
				clearTyping();
				addMessage(data.message, { direction: 'incoming' });
			}, 500);

		} catch (error) {
			console.error('Error calling Netlify function:', error);
			alert('Network error, please try again later');
			clearTyping();
		}

		function clearTyping() {
			clearTimeout(timer);
			setTyping(false);
		}

	};

	const updateRtl = (text) => {
		setInputClassName(isRtl(text) ? 'is-rtl' : '');
	}

	return <MainContainer>
		<ChatContainer>
			<ConversationHeader>
				<Avatar
					name="Thera"
					src={getAvatarSvg()}
				/>
				<ConversationHeader.Content>
					<div>
						<div className="has-text-weight-bold">Thera</div>
						<div className="is-flex is-align-items-center">
							<span className="is-inline-block mr-1" style={{ width: '.7em', height: '.7em', backgroundColor: '#00bb00', borderRadius: '100%' }}></span>
							Online
						</div>
					</div>
				</ConversationHeader.Content>
			</ConversationHeader>
			<MessageList typingIndicator={!isTyping ? null : <TypingIndicator className="px-4" content="Thera is typing" />} className="pt-4">
				{messages.map((message, index) => <Message model={message} key={index} className={isRtl(message.message) ? 'is-rtl' : ''} />)}
			</MessageList>
			<MessageInput onChange={updateRtl} onSend={sendMessage} attachButton={false} className={inputClassName} style={{ border: 0 }} placeholder="Type message here" />
		</ChatContainer>
	</MainContainer>;
}

function isRtl(text) {
	return (text.match(/[\u0590-\u05FF\u0600-\u06FF]/g) || []).length > 0;
}

function getAvatarSvg() {
	return 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20280%20280%22%20fill%3D%22none%22%20shape-rendering%3D%22auto%22%3E%3Cmetadata%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Adcterms%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%22%3E%3Crdf%3ARDF%3E%3Crdf%3ADescription%3E%3Cdc%3Atitle%3EAvataaars%3C%2Fdc%3Atitle%3E%3Cdc%3Acreator%3EPablo%20Stanley%3C%2Fdc%3Acreator%3E%3Cdc%3Asource%20xsi%3Atype%3D%22dcterms%3AURI%22%3Ehttps%3A%2F%2Favataaars.com%2F%3C%2Fdc%3Asource%3E%3Cdcterms%3Alicense%20xsi%3Atype%3D%22dcterms%3AURI%22%3Ehttps%3A%2F%2Favataaars.com%2F%3C%2Fdcterms%3Alicense%3E%3Cdc%3Arights%3ERemix%20of%20%E2%80%9EAvataaars%E2%80%9D%20(https%3A%2F%2Favataaars.com%2F)%20by%20%E2%80%9EPablo%20Stanley%E2%80%9D%2C%20licensed%20under%20%E2%80%9EFree%20for%20personal%20and%20commercial%20use%E2%80%9D%20(https%3A%2F%2Favataaars.com%2F)%3C%2Fdc%3Arights%3E%3C%2Frdf%3ADescription%3E%3C%2Frdf%3ARDF%3E%3C%2Fmetadata%3E%3Cmask%20id%3D%228zmargbd%22%3E%3Crect%20width%3D%22280%22%20height%3D%22280%22%20rx%3D%220%22%20ry%3D%220%22%20x%3D%220%22%20y%3D%220%22%20fill%3D%22%23fff%22%20%2F%3E%3C%2Fmask%3E%3Cg%20mask%3D%22url(%238zmargbd)%22%3E%3Crect%20fill%3D%22%23d1d4f9%22%20width%3D%22280%22%20height%3D%22280%22%20x%3D%220%22%20y%3D%220%22%20%2F%3E%3Cg%20transform%3D%22translate(8)%22%3E%3Cpath%20d%3D%22M132%2036a56%2056%200%200%200-56%2056v6.17A12%2012%200%200%200%2066%20110v14a12%2012%200%200%200%2010.3%2011.88%2056.04%2056.04%200%200%200%2031.7%2044.73v18.4h-4a72%2072%200%200%200-72%2072v9h200v-9a72%2072%200%200%200-72-72h-4v-18.39a56.04%2056.04%200%200%200%2031.7-44.73A12%2012%200%200%200%20198%20124v-14a12%2012%200%200%200-10-11.83V92a56%2056%200%200%200-56-56Z%22%20fill%3D%22%23edb98a%22%2F%3E%3Cpath%20d%3D%22M108%20180.61v8a55.79%2055.79%200%200%200%2024%205.39c8.59%200%2016.73-1.93%2024-5.39v-8a55.79%2055.79%200%200%201-24%205.39%2055.79%2055.79%200%200%201-24-5.39Z%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.1%22%2F%3E%3Cg%20transform%3D%22translate(0%20170)%22%3E%3Cpath%20d%3D%22M132.5%2051.83c18.5%200%2033.5-9.62%2033.5-21.48%200-.36-.01-.7-.04-1.06A72%2072%200%200%201%20232%20101.04V110H32v-8.95a72%2072%200%200%201%2067.05-71.83c-.03.37-.05.75-.05%201.13%200%2011.86%2015%2021.48%2033.5%2021.48Z%22%20fill%3D%22%23E6E6E6%22%2F%3E%3Cpath%20d%3D%22M132.5%2058.76c21.89%200%2039.63-12.05%2039.63-26.91%200-.6-.02-1.2-.08-1.8-2-.33-4.03-.59-6.1-.76.04.35.05.7.05%201.06%200%2011.86-15%2021.48-33.5%2021.48S99%2042.2%2099%2030.35c0-.38.02-.76.05-1.13-2.06.14-4.08.36-6.08.67-.07.65-.1%201.3-.1%201.96%200%2014.86%2017.74%2026.91%2039.63%2026.91Z%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.16%22%2F%3E%3Cpath%20d%3D%22M100.78%2029.12%20101%2028c-2.96.05-6%201-6%201l-.42.66A72.01%2072.01%200%200%200%2032%20101.06V110h74s-10.7-51.56-5.24-80.8l.02-.08ZM158%20110s11-53%205-82c2.96.05%206%201%206%201l.42.66a72.01%2072.01%200%200%201%2062.58%2071.4V110h-74Z%22%20fill%3D%22%23262e33%22%2F%3E%3Cpath%20d%3D%22M101%2028c-6%2029%205%2082%205%2082H90L76%2074l6-9-6-6%2019-30s3.04-.95%206-1ZM163%2028c6%2029-5%2082-5%2082h16l14-36-6-9%206-6-19-30s-3.04-.95-6-1Z%22%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.15%22%2F%3E%3Cpath%20d%3D%22m183.42%2085.77.87-2.24%206.27-4.7a4%204%200%200%201%204.85.05l6.6%205.12-18.59%201.77Z%22%20fill%3D%22%23E6E6E6%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(78%20134)%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M40%2015a14%2014%200%201%200%2028%200%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.7%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(104%20122)%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M16%208c0%204.42%205.37%208%2012%208s12-3.58%2012-8%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.16%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(76%2090)%22%3E%3Cpath%20d%3D%22M16.16%2022.45c1.85-3.8%206-6.45%2010.84-6.45%204.81%200%208.96%202.63%2010.82%206.4.55%201.13-.24%202.05-1.03%201.37a15.05%2015.05%200%200%200-9.8-3.43c-3.73%200-7.12%201.24-9.55%203.23-.9.73-1.82-.01-1.28-1.12ZM74.16%2022.45c1.85-3.8%206-6.45%2010.84-6.45%204.81%200%208.96%202.63%2010.82%206.4.55%201.13-.24%202.05-1.03%201.37a15.05%2015.05%200%200%200-9.8-3.43c-3.74%200-7.13%201.24-9.56%203.23-.9.73-1.82-.01-1.28-1.12Z%22%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.6%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(76%2082)%22%3E%3Cpath%20d%3D%22M26.55%206.15c-5.8.27-15.2%204.49-14.96%2010.34.01.18.3.27.43.12%202.76-2.96%2022.32-5.95%2029.2-4.36.64.14%201.12-.48.72-.93-3.43-3.85-10.2-5.43-15.4-5.18ZM86.45%206.15c5.8.27%2015.2%204.49%2014.96%2010.34-.01.18-.3.27-.43.12-2.76-2.96-22.32-5.95-29.2-4.36-.64.14-1.12-.48-.72-.93%203.43-3.85%2010.2-5.43%2015.4-5.18Z%22%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%23000%22%20fill-opacity%3D%22.6%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(-1)%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M167.3%2035c-20.18-11.7-40.17-9.78-55.26-5.97-15.1%203.8-24.02%2014.62-31.68%2030.62a67.68%2067.68%200%200%200-6.34%2025.83c-.13%203.41.33%206.94%201.25%2010.22.33%201.2%202.15%205.39%202.65%202%20.17-1.12-.44-2.67-.5-3.86-.08-1.57%200-3.16.11-4.73.2-2.92.73-5.8%201.65-8.59%201.33-3.98%203.02-8.3%205.6-11.67%206.4-8.33%2017.49-8.8%2026.29-13.39-.77%201.4-3.7%203.68-2.7%205.27.71%201.1%203.38.76%204.65.72%203.35-.09%206.72-.67%2010.02-1.14a71.5%2071.5%200%200%200%2015-4.1c4.02-1.5%208.61-2.88%2011.63-6.07a68.67%2068.67%200%200%200%2017.4%2013c5.62%202.88%2014.68%204.32%2018.11%2010.16%204.07%206.91%202.2%2015.4%203.44%2022.9.47%202.85%201.54%202.79%202.13.24%201-4.33%201.47-8.83%201.15-13.28-.72-10.05-4.4-36.45-24.6-48.15Z%22%20fill%3D%22%23d6b370%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(49%2072)%22%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate(62%2042)%22%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
}