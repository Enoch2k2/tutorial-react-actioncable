import React, { useState, useEffect } from 'react'
import { API_ROOT, HEADERS } from '../constants';

const NewMessageForm = (props) => {
  const [ text, setText ] = useState('')
  const [ conversation_id, setConversation_id ] = useState(props.conversation_id);

  useEffect(() => {
    setConversation_id(props.conversation_id)
  }, [props.conversation_id])

  const handleChange = e => {
    setText( e.target.value );
  };

  const handleSubmit = e => {
    e.preventDefault();

    fetch(`${API_ROOT}/messages`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ text, conversation_id })
    });
    setText('');
  };

  return (
    <div>
      <div className="newMessageForm">
        <form onSubmit={ handleSubmit }>
          <label>New Message:</label>
          <br />
          <input
            type="text"
            value={ text }
            onChange={ handleChange }
          />
          <input type="submit" />
        </form>
      </div>      
    </div>
  )
}

export default NewMessageForm
