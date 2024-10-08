import { useState } from "react";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, ConversationHeader, Avatar, TypingIndicator } from "@chatscope/chat-ui-kit-react";

import useChat from "../hooks/use-chat";

// get version from package.json
const version = process.env.npm_package_version;

export default function Chat() {

	const [inputClassName, setInputClassName] = useState('');

	const { status, messages, reply, isBotTyping, onUserTyping, userInputType } = useChat();
	const onSend = (message) => reply(message.replaceAll('&nbsp;', '').trim());

	const { copyChat, copyButtonLabel, copyButtonClassName } = useCopyChat(messages);

	const onMessageInputChange = (text) => {
		onUserTyping();
		updateRtl(text);
	}

	const updateRtl = (text) => {
		setInputClassName(isRtl(text) ? 'has-rtl' : '');
	}

	return <MainContainer>
		<ChatContainer>
			<ConversationHeader>
				<Avatar
					name="MUUSH"
					src={getAvatar()}
					style={{ border: '2px solid #98d3ff' }}
				/>
				<ConversationHeader.Content>
					<div className="is-flex is-justify-content-space-between">
						<div>
							<div className="has-text-weight-bold">MUUSH</div>
							<div className="is-flex is-align-items-center">
								v{version}
							</div>
						</div>
						<div className="is-flex is-align-items-center">
							<button className={copyButtonClassName} onClick={copyChat}>{copyButtonLabel}</button>
						</div>
					</div>
				</ConversationHeader.Content>
			</ConversationHeader>
			<MessageList typingIndicator={!isBotTyping ? null : <TypingIndicator className="px-4" content="MUUSH is typing" />} className="pt-4">
				{messages.map((message, index) => <Message model={message} key={index} />)}
			</MessageList>
			{(status && userInputType === 'open-question') && <MessageInput onChange={onMessageInputChange} onSend={onSend} attachButton={false} className={inputClassName} style={{ border: 0 }} placeholder="Type message here" />}
		</ChatContainer>
	</MainContainer>

}

function useCopyChat(messages) {

	const copyButtonBaseClassName = "button is-light is-small";
	const [copyButtonClassName, setCopyButtonClassName] = useState(`${copyButtonBaseClassName} is-info`);
	const [copyButtonLabel, setCopyButtonLabel] = useState('Copy chat');
	const copyChat = () => {
		const text = `${window.totalCost}\n\n${messages.map(({ payload, direction, name }) => `${direction === 'incoming' ? `[${name}]\nBot: ` : 'User: '}${SymbolReactElementToString(payload)}`).join('\n\n') }`;
		navigator.clipboard.writeText(text);
		setCopyButtonLabel('Copied!');
		setCopyButtonClassName(`${copyButtonBaseClassName} is-success`);
		setTimeout(() => {
			setCopyButtonLabel('Copy chat');
			setCopyButtonClassName(`${copyButtonBaseClassName} is-info`);
		}, 2000);
	}

	return { copyChat, copyButtonLabel, copyButtonClassName };
}

function SymbolReactElementToString(reactElement) {
	// return text content regardless of how deeply nested the text is
	if (typeof reactElement === 'string') return reactElement;
	if (Array.isArray(reactElement)) return reactElement.map(SymbolReactElementToString).join('');
	if (typeof reactElement === 'object' && reactElement.props) return SymbolReactElementToString(reactElement.props.children);
	return '';
}

function isRtl(text) {
	if (!text) return false;
	return (text.match(/[\u0590-\u05FF\u0600-\u06FF]/g) || []).length > 0;
}

function getAvatar() {
	return 'data:image/jpeg;base64,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';
}