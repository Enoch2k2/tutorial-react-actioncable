# Creating a Chat Application with React + Action Cable

### backend

We will need (backend)

* Redis for production (brew install redis, uncomment redis gem in gemfile for rails)
* A route for action cable

```
Rails.application.routes.draw do
  resources :conversations, only: [:index, :create]
  resources :messages, only: [:create]
  mount ActionCable.server => '/cable'     # <- this one
end

```
* Active Model Serializer gem
* setting up our channels -> conversation channel that uses stream_for, message channel that is based off a conversation model, in particular a particular conversation
* The controllers when creating a conversation or a message will actually not render back json, but trigger a broad cast with json information:
```
 # ConversationsController
  def create
    conversation = Conversation.new(conversation_params)
    if conversation.save
      serialized_data = ActiveModelSerializers::Adapter::Json.new(
        ConversationSerializer.new(conversation)
      ).serializable_hash
      ActionCable.server.broadcast 'conversations_channel', serialized_data
      head :ok
    end
  end
 # MessagesController
  def create
    message = Message.new(message_params)
    conversation = Conversation.find(message_params[:conversation_id])
    if message.save
      serialized_data = ActiveModelSerializers::Adapter::Json.new(
        MessageSerializer.new(message)
      ).serializable_hash
      MessagesChannel.broadcast_to conversation, serialized_data
      head :ok
    end
  end 
```
* The reason we broadcast to the channels is because we want our react applications to be able to handle what we broadcast on the front end on all clients connected to the server.
* The reason we use ActiveModelSerializers::Adapter::Json.new instead of using render is because we are broadcasting, it doesn't automatically render back json hash format, so we have to do that ourselves.
```
MessagesChannel.broadcast_to conversation, serialized_data
```
* The above is using broadcast_to which syncs up with stream_for conversation, it's how we pass that information to it from the controller to the particular conversation in our messages_channel.

### Frontend

Here's a list of things we need in the frontend: 
* Frontend uses a package `react-actioncable-provider` in order to cleanly be provided with the toolset / components needed to connect to ActionCable on the rails side.
* You will have two seperate routes for connecting to the API and to our websockets, localhost will be for our API and ws:// will be for our websockets. An example of this in this particular project is:
```
Found in our constants/index.js file:
export const API_ROOT = 'http://localhost:3000';
export const API_WS_ROOT = 'ws://localhost:3000/cable'; // this route matches the /cable route in the route.rb file which is why we mounted that route for action cable to connect to.
```
* You will need the `API_WS_ROOT` route for an ActionCableProvider component you will need to use in index.js.
```
<ActionCableProvider url={API_WS_ROOT}>
  <App />
</ActionCableProvider>
```
I have a theory which i still have to research that it provides the ActionCable components the url they need in order to subscribe to Rails ActionCable.
* In order for us to subscribe to a channel, we use the ActionCable component inside of a component. Such as we did in the ConversationList Component:
```
      <ActionCable
        channel={{ channel: 'ConversationsChannel' }}
        onReceived={handleReceivedConversation}
      />

      // Here we mentioned which channel we were going to connect to, as well as what to do if we are sent data back from action cable. So anytime conversations channel sends something back, handleReceivedConversation will be called.
```
* Also a note about this ( found in Cable Component):
```
<ActionCable
  key={conversation.id}  
  channel={{ channel: 'MessagesChannel', conversation_id: conversation.id }}
  onReceived={handleReceivedMessage}
/>

// when we subscribe to the messages channel, the second argument of channel is what param we are sending, which is how it gets conversation_id
```
TBD


Resources:
Code belongs to a tutorial found online @ https://medium.com/@dakota.lillie/using-action-cable-with-react-c37df065f296 author Dakota Lillie. Slight changes into hooks were made.