import MessagesPage from '@/app/messages/page'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Chat | Learnity',
  description: 'Your conversations with teachers and students.',
};

const page = () => {
  return (
    <>
    <MessagesPage/>
    </>
  )
}

export default page