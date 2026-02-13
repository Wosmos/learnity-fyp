import Link from 'next/link';
import Logo from '../ui/logo';

const Footer = () => {
  return (
    <footer className='bg-white border-t mt-auto'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex flex-col sm:flex-row justify-between items-center'>
          <Logo showText={true} textColor='text-slate-950' bgClass='bg-black' />
          <div className='flex items-center space-x-4 text-sm text-gray-500'>
            <Link href='/privacy' className='hover:text-gray-700'>
              Privacy
            </Link>
            <Link href='/terms' className='hover:text-gray-700'>
              Terms
            </Link>
            <Link href='/support' className='hover:text-gray-700'>
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
