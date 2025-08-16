'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import DynamicMethods from '@/app/components/Methods';
import { DynamicWidget } from '@/lib/dynamic';
import { useDarkMode } from '@/lib/useDarkMode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ShadcnDemo from '@/components/ShadcnDemo';

export default function Main() {
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
      <div className="absolute top-0 flex items-center justify-between w-full p-4">
        <Image
          className="h-8"
          src={isDarkMode ? '/logo-light.png' : '/logo-dark.png'}
          alt="dynamic"
          width={300}
          height={60}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                'https://docs.dynamic.xyz',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            Docs
          </Button>
          <Button
            onClick={() =>
              window.open(
                'https://app.dynamic.xyz',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            Get started
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-4xl px-4">
        <Card className="w-full">
          <CardContent className="p-6">
            <DynamicWidget />
          </CardContent>
        </Card>

        <DynamicMethods isDarkMode={isDarkMode} />

        <ShadcnDemo />
      </div>

      <div className="absolute bottom-0 right-5">
        <div className="absolute bottom-1.5 right-5 text-muted-foreground text-sm font-medium z-10">
          Made with 💙 by dynamic
        </div>
        <Image
          className="h-60 w-auto ml-2"
          src={isDarkMode ? '/image-dark.png' : '/image-light.png'}
          alt="dynamic"
          width={400}
          height={300}
        />
      </div>
    </div>
  );
}
