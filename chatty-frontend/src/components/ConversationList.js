import React, { useState, useEffect } from 'react'
import { ActionCable } from 'react-actioncable-provider';
import { API_ROOT } from '../constants';
import NewConversationForm from './NewConversationForm';
import MessagesArea from './MessagesArea';
import Cable from './Cable'

const ConversationList = () => {
  const [ conversations, setConversations ] = useState([]);
  const [ activeConversation, setActiveConversation ] = useState(null);

  useEffect(() => {
    fetch(`${API_ROOT}/conversations`)
      .then(res => res.json())
      .then(conversations => setConversations( conversations ));
  }, [])

  const handleClick = id => {
    setActiveConversation( id );
  };

  const handleReceivedConversation = response => {
    setConversations([ ...conversations, response.conversation ]);
  };


  const handleReceivedMessage = response => {
    const { message } = response;
    const conversationsCopy = [...conversations];
    const conversation = conversationsCopy.find(
      conversation => conversation.id === message.conversation_id
    );
    conversation.messages = [...conversation.messages, message];
    console.log(conversationsCopy);
    setConversations( conversationsCopy );
  };

  return (
    <div className="conversationsList">
      <ActionCable
        channel={{ channel: 'ConversationsChannel' }}
        onReceived={handleReceivedConversation}
      />
      {conversations.length ? (
        <Cable
          conversations={conversations}
          handleReceivedMessage={handleReceivedMessage}
        />
      ) : null}
      <h2>Conversations</h2>
      <ul>{mapConversations(conversations, handleClick)}</ul>
      <NewConversationForm />
      {activeConversation ? (
        <MessagesArea
          conversation={findActiveConversation(
            conversations,
            activeConversation
          )}
        />
      ) : null}
  </div>
  )
}

export default ConversationList

const findActiveConversation = (conversations, activeConversation) => {
  return conversations.find(
    conversation => conversation.id === activeConversation
  );
};

const mapConversations = (conversations, handleClick) => {
  return conversations.map(conversation => {
    return (
      <li key={conversation.id} onClick={() => handleClick(conversation.id)}>
        {conversation.title}
      </li>
    );
  });
};