import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./components/ui/alert-dialog";
import { Button } from "./components/ui/button";
import { Trash2 } from "lucide-react";

const BabyTracker = () => {
  const [isFeedingOpen, setIsFeedingOpen] = useState(false);
  const [isDiaperOpen, setIsDiaperOpen] = useState(false);
  const [isNapOpen, setIsNapOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [selectedFeedingType, setSelectedFeedingType] = useState(null);
  const [entryToEdit, setEntryToEdit] = useState(null);

  const handleEdit = (timestamp) => {
    if (entryToEdit && timestamp) {
      const newEntries = entries.map(entry => {
        if (entry.id === entryToEdit) {
          return { ...entry, timestamp: new Date(timestamp).toISOString() };
        }
        return entry;
      });
      setEntries(newEntries);
      saveData(newEntries);
      setEntryToEdit(null);
    }
  };

  const amounts = [null, ...Array.from({ length: 30 }, (_, i) => (i + 1) * 10)];

  const loadData = async () => {
    try {
      const response = await fetch('/tymek/data.php');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Błąd podczas wczytywania danych:', error);
    }
  };

  const saveData = async (newEntries) => {
    try {
      await fetch('/tymek/data.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntries)
      });
    } catch (error) {
      console.error('Błąd podczas zapisywania danych:', error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Wczoraj';
    }
    
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const calculateNapDuration = (napEntry, allEntries) => {
    const napTime = new Date(napEntry.timestamp).getTime();
    
    // Filtrujemy tylko wpisy nowsze od drzemki
    const newerEntries = allEntries.filter(entry => 
      new Date(entry.timestamp).getTime() > napTime
    );

    // Sortujemy od najstarszego do najnowszego i bierzemy pierwszy
    const nextEntry = newerEntries
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      [0];
    
    if (!nextEntry) return null;

    const nextTime = new Date(nextEntry.timestamp).getTime();
    const duration = (nextTime - napTime) / (1000 * 60); // konwersja na minuty
    
    // Zaokrąglamy do pełnych minut
    const roundedDuration = Math.round(duration);
    
    if (roundedDuration < 60) {
      return `${roundedDuration}min`;
    } else {
      const hours = Math.floor(roundedDuration / 60);
      const minutes = roundedDuration % 60;
      if (minutes > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${hours}h`;
    }
  };

  const renderEntryDetails = (entry) => {
    if (entry.type === 'feeding') {
      const feedingTypeText = entry.feedingType === 'breast' ? 'Pierś' : 'Mleko modyfikowane';
      const amountText = entry.amount ? `${entry.amount} ml` : '?';
      return <span className="font-medium">{`${feedingTypeText} (${amountText})`}</span>;
    } else if (entry.type === 'diaper') {
      return (
        <span className="font-bold">
          {entry.diaperType === 'poop' ? 'Kupa 💩' : 'Siku'}
        </span>
      );
    } else if (entry.type === 'nap') {
      const duration = calculateNapDuration(entry, entries);
      return (
        <span className="font-medium">
          Drzemka 😴
          {duration && (
            <span className="ml-2 text-[#636e72]">
              ({duration})
            </span>
          )}
        </span>
      );
    }
  };

  const handleFeedingSave = (amount) => {
    const newEntry = {
      id: Date.now(),
      type: 'feeding',
      feedingType: selectedFeedingType,
      timestamp: new Date().toISOString(),
      amount: amount
    };
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    saveData(newEntries);
    setIsFeedingOpen(false);
    setSelectedFeedingType(null);
  };

  const handleDiaperSave = (diaperType) => {
    const newEntry = {
      id: Date.now(),
      type: 'diaper',
      timestamp: new Date().toISOString(),
      diaperType: diaperType
    };
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    saveData(newEntries);
    setIsDiaperOpen(false);
  };

  const handleNapSave = () => {
    const newEntry = {
      id: Date.now(),
      type: 'nap',
      timestamp: new Date().toISOString()
    };
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    saveData(newEntries);
    setIsNapOpen(false);
  };

  const handleDelete = () => {
    if (entryToDelete) {
      const newEntries = entries.filter(entry => entry.id !== entryToDelete);
      setEntries(newEntries);
      saveData(newEntries);
    }
    setEntryToDelete(null);
  };

  const handleCloseFeedingDialog = (isOpen) => {
    setIsFeedingOpen(isOpen);
    if (!isOpen) {
      setSelectedFeedingType(null);
    }
  };

  const renderFeedingDialog = () => {
    if (!selectedFeedingType) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Wybierz rodzaj karmienia</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              onClick={() => setSelectedFeedingType('bottle')}
              variant="outline"
              className="text-lg h-16"
            >
              Mleko modyfikowane
            </Button>
            <Button 
              onClick={() => setSelectedFeedingType('breast')}
              variant="outline"
              className="text-lg h-16"
            >
              Pierś
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>
            {selectedFeedingType === 'bottle' ? 'Wybierz ilość mleka (ml)' : 'Wybierz ilość'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 py-4 max-h-[60vh] overflow-y-auto">
          {amounts.map((amount, index) => (
            <Button 
              key={index}
              onClick={() => handleFeedingSave(amount)}
              variant="outline"
              className="text-base sm:text-lg h-12 sm:h-14"
            >
              {amount === null ? '?' : `${amount} ml`}
            </Button>
          ))}
        </div>
        <Button 
          variant="ghost" 
          onClick={() => setSelectedFeedingType(null)}
          className="mt-2"
        >
          ← Wróć do wyboru rodzaju
        </Button>
      </>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 bg-[#dfe6e9] min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#2d3436]">Dzienniczek dziecka</h1>
      
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Dialog open={isFeedingOpen} onOpenChange={handleCloseFeedingDialog}>
          <DialogTrigger asChild>
            <Button>Karmienie</Button>
          </DialogTrigger>
          
          <DialogContent>
            {renderFeedingDialog()}
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => handleCloseFeedingDialog(false)}
                className="mt-4"
              >
                Anuluj
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDiaperOpen} onOpenChange={setIsDiaperOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Pieluszka</Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wybierz rodzaj</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button 
                onClick={() => handleDiaperSave('poop')}
                variant="outline"
                className="text-lg h-16"
              >
                Kupa
              </Button>
              <Button 
                onClick={() => handleDiaperSave('pee')}
                variant="outline"
                className="text-lg h-16"
              >
                Siku
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsDiaperOpen(false)}
                className="mt-4"
              >
                Anuluj
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isNapOpen} onOpenChange={setIsNapOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Drzemka</Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Potwierdzenie drzemki</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-gray-600 mb-4">Czy chcesz zapisać nową drzemkę?</p>
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsNapOpen(false)}
                >
                  Anuluj
                </Button>
                <Button 
                  onClick={handleNapSave}
                >
                  Zapisz
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!entryToEdit} onOpenChange={(isOpen) => !isOpen && setEntryToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj datę i czas</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {entryToEdit && (
              <input
                type="datetime-local"
                defaultValue={new Date(entries.find(e => e.id === entryToEdit)?.timestamp || '')
                  .toISOString().slice(0, 16)}
                onChange={(e) => handleEdit(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setEntryToEdit(null)}
              className="mt-4"
            >
              Anuluj
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={entryToDelete !== null} onOpenChange={(isOpen) => !isOpen && setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdzenie usunięcia</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć ten wpis?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>NIE</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#d63031] hover:bg-[#c62929] text-white">
              Tak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="border rounded-lg bg-white shadow-lg divide-y divide-[#dfe6e9]">
        {Object.entries(entries.reduce((acc, entry) => {
          const date = new Date(entry.timestamp).toDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(entry);
          return acc;
        }, {}))
        // Sortowanie grup dat (od najnowszej)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .map(([date, dateEntries]) => (
          <div key={date}>
            <div className="px-2 sm:px-6 py-2 bg-[#dfe6e9] font-medium text-[#2d3436]">
              {formatDate(dateEntries[0].timestamp)}
            </div>
            <table className="w-full">
              <tbody className="divide-y">
                {dateEntries
                  // Sortowanie wpisów w grupie (od najnowszej)
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(entry => (
                  <tr key={entry.id}>
                    <td className="px-2 sm:px-6 py-4 w-24 sm:w-32">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatTime(entry.timestamp)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#0984e3] hover:text-[#0874d3] hover:bg-[#dfe6e9]"
                          onClick={() => setEntryToEdit(entry.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-4">{renderEntryDetails(entry)}</td>
                    <td className="px-2 sm:px-6 py-4 w-12 sm:w-20">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#d63031] hover:text-[#c62929] hover:bg-[#dfe6e9]"
                        onClick={() => setEntryToDelete(entry.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BabyTracker;