import React, { createContext, useContext, useState, useCallback } from 'react';
import { scrollToAndHighlight } from '../utils/evidenceHighlighter';

export interface NavigationEntry {
  id: string;
  label: string; // e.g. "AI Case Presentation", "Today's Consultation", "Symptoms Tab"
  view?: string; // 'reception' | 'ma' | 'patient-detail'
  tab?: string; // 'overview' | 'records' | 'vitals' | 'symptoms' | 'history' | 'trends' | 'doctor-view'
  targetElementId?: string;
  scrollY?: number;
  timestamp: number;
}

interface NavigationContextType {
  historyStack: NavigationEntry[];
  canGoBack: boolean;
  previousLocationLabel: string | null;
  pushNavigation: (entry: Omit<NavigationEntry, 'id' | 'timestamp'>) => void;
  popNavigation: () => NavigationEntry | null;
  navigateToEvidence: (
    targetTab: string,
    targetElementId?: string,
    sourceLabel?: string,
    fromLabel?: string
  ) => void;
  clearHistory: () => void;
  highlightEvidence: (elementId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [historyStack, setHistoryStack] = useState<NavigationEntry[]>([]);

  const pushNavigation = useCallback((entry: Omit<NavigationEntry, 'id' | 'timestamp'>) => {
    setHistoryStack((prev) => [
      ...prev,
      {
        ...entry,
        id: `nav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const popNavigation = useCallback((): NavigationEntry | null => {
    let popped: NavigationEntry | null = null;
    setHistoryStack((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      popped = copy.pop() || null;
      return copy;
    });
    return popped;
  }, []);

  const clearHistory = useCallback(() => {
    setHistoryStack([]);
  }, []);

  const highlightEvidence = useCallback((elementId: string) => {
    scrollToAndHighlight(elementId);
  }, []);

  const navigateToEvidence = useCallback(
    (targetTab: string, targetElementId?: string, sourceLabel?: string, fromLabel = 'AI Case Presentation') => {
      // Record current state before navigating
      pushNavigation({
        label: fromLabel,
        tab: 'overview',
        targetElementId: 'ai-clinical-case-presentation',
        scrollY: window.scrollY,
      });

      // Target element highlight after tab switch
      if (targetElementId) {
        setTimeout(() => {
          scrollToAndHighlight(targetElementId);
        }, 120);
      }
    },
    [pushNavigation]
  );

  const canGoBack = historyStack.length > 0;
  const previousLocationLabel = canGoBack ? historyStack[historyStack.length - 1].label : null;

  return (
    <NavigationContext.Provider
      value={{
        historyStack,
        canGoBack,
        previousLocationLabel,
        pushNavigation,
        popNavigation,
        navigateToEvidence,
        clearHistory,
        highlightEvidence,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      historyStack: [],
      canGoBack: false,
      previousLocationLabel: null,
      pushNavigation: () => {},
      popNavigation: () => null,
      navigateToEvidence: () => {},
      clearHistory: () => {},
      highlightEvidence: (id: string) => scrollToAndHighlight(id),
    };
  }
  return context;
};
