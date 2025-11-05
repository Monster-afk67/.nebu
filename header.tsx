'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Upload, Settings, Search, ArrowLeft, Notebook } from 'lucide-react';
import type { Tab } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportNebuFile, importNebuFile, saveScratchpads } from '@/lib/nebu-handler';

interface HeaderProps {
  tabs?: Tab[];
  setTabs?: React.Dispatch<React.SetStateAction<Tab[]>>;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function Header({ tabs, setTabs, searchQuery, setSearchQuery }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const pathname = usePathname();
  const isSettingsPage = pathname === '/settings';
  const isEditorPage = /^\/editor(\/.*)?$/.test(pathname);

  const handleBackup = () => {
    if (!tabs) return;
    
    const result = exportNebuFile(tabs);

    if (result.success) {
       toast({
        title: 'Backup Successful',
        description: 'Your .nebu file has been downloaded.',
      });
    } else {
       toast({
        title: 'Backup Failed',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !setTabs) return;

    try {
      const { tabs: importedTabs, scratchpads: importedScratchpads } = await importNebuFile(file);

      setTabs(importedTabs);
      toast({
        title: 'Tabs Restored',
        description: 'Your tabs have been restored from the backup file.',
      });

      if (importedScratchpads.length > 0) {
        const saveResult = saveScratchpads(importedScratchpads);
        if (saveResult.success) {
           toast({
              title: 'Scratchpads Restored',
              description: 'Your scratchpads have also been restored.',
          });
        } else {
           toast({
              title: 'Scratchpad Restore Failed',
              description: saveResult.message,
              variant: 'destructive'
          });
        }
      }

    } catch (error) {
      console.error('Failed to restore:', error);
      toast({
        title: 'Restore Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not read the backup file.',
        variant: 'destructive',
      });
    } finally {
      // Reset file input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  return (
    <header className="flex items-center justify-between gap-4">
       <div className="flex items-center gap-2">
        {(isSettingsPage || isEditorPage) && (
          <Link href="/">
            <Button variant="outline" size="icon" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5 text-accent drop-shadow-[0_0_5px_hsl(var(--accent))]" />
            </Button>
          </Link>
        )}
        <Link href="/">
          <h1 className="text-3xl font-bold text-primary drop-shadow-[0_0_8px_hsl(var(--primary))] hidden sm:block">
            Nebula
          </h1>
        </Link>
       </div>
      <div className={cn("relative flex-grow", (isSettingsPage || isEditorPage) && "hidden md:block")}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          type="search"
          placeholder="Search tabs by title, content, or tag..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          disabled={isSettingsPage || isEditorPage}
        />
      </div>
      <div className="flex items-center gap-2">
        {!isSettingsPage && !isEditorPage && (
          <>
            <Button onClick={handleBackup} variant="outline" size="icon" aria-label="Backup tabs">
                <Download className="w-5 h-5 text-accent drop-shadow-[0_0_5px_hsl(var(--accent))]" />
            </Button>
            <Button onClick={handleRestoreClick} variant="outline" size="icon" aria-label="Restore tabs">
                <Upload className="w-5 h-5 text-accent drop-shadow-[0_0_5px_hsl(var(--accent))]" />
            </Button>
          </>
        )}
        <Link href="/editor">
          <Button variant="outline" size="icon" aria-label="Editor" disabled={isEditorPage}>
            <Notebook className="w-5 h-5 text-accent drop-shadow-[0_0_5px_hsl(var(--accent))]" />
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline" size="icon" aria-label="Settings" disabled={isSettingsPage}>
            <Settings className="w-5 h-5 text-accent drop-shadow-[0_0_5px_hsl(var(--accent))]" />
          </Button>
        </Link>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".nebu,application/json"
          onChange={handleFileChange}
        />
      </div>
    </header>
  );
}
