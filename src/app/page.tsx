
"use client"

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { ExplanationsTab } from '@/components/ExplanationsTab';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, Database, Loader2 } from 'lucide-react';
import { useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';

export default function Home() {
  const [activeTab, setActiveTab] = useState('notes');
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Initializing DocuSpark...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-white border-b px-6 flex items-center justify-between">
            <TabsList className="bg-transparent border-none p-0 gap-6">
              <TabsTrigger 
                value="notes" 
                className="h-14 px-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold text-muted-foreground"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Notes & Documents
              </TabsTrigger>
              <TabsTrigger 
                value="explanations"
                className="h-14 px-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none font-semibold text-muted-foreground"
              >
                <Database className="w-4 h-4 mr-2" />
                Explanation Hub
              </TabsTrigger>
            </TabsList>
            
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                {user ? 'Cloud Synced' : 'Syncing...'}
              </span>
            </div>
          </div>

          <TabsContent value="notes" className="flex-1 m-0 p-0 overflow-hidden outline-none">
            <NoteEditor />
          </TabsContent>
          
          <TabsContent value="explanations" className="flex-1 m-0 p-0 overflow-hidden outline-none">
            <ExplanationsTab />
          </TabsContent>
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
}
