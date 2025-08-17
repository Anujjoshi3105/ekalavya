'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formUrlQuery, removeKeysFromUrlQuery } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';


const SearchInput = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('topic') || '';
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const paramsObj = Object.fromEntries(searchParams.entries());

      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: paramsObj,
          key: 'topic',
          value: searchQuery,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === '/companion') {
          const newUrl = removeKeysFromUrlQuery({
            params: paramsObj,
            keysToRemove: ['topic'],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, searchParams, pathname]);

  return (
    <div className="relative border border-border rounded-lg items-center flex gap-2 p-2 sm:w-[350px] w-full h-fit">
      <SearchIcon className="size-4" />
      <input
        placeholder="Search companions..."
        className="outline-none "
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
