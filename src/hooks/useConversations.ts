import { useAtom } from 'jotai';
import { conversationsAtom, selectedConversationAtom, messagesAtom } from '../atoms/conversations';
import axios from 'axios';

export const useConversations = () => {
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useAtom(selectedConversationAtom);
  const [messages, setMessages] = useAtom(messagesAtom);

  const fetchMyConversations = async () => {
    const response = await axios.get('/conversations/my-conversations');
    setConversations(response.data);
  };

  const sendMessage = async (conversationId: string, messageData: any) => {
    const response = await axios.post(`/conversations/${conversationId}/messages`, messageData);
    setMessages([...messages, response.data]);
    return response.data;
  };

  const createConversation = async (participantIds: string[]) => {
    const response = await axios.post('/conversations', { participantIds });
    setConversations([...conversations, response.data]);
    return response.data;
  };

  return {
    conversations,
    selectedConversation,
    messages,
    fetchMyConversations,
    sendMessage,
    createConversation,
    setSelectedConversation,
  };
}; 