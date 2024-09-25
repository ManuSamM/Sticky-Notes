'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Note {
  id: string;
  text: string;
  position: {
    top: number;
    left: number;
  };
  color: string;
}

const colors = ['bg-yellow-300', 'bg-green-300', 'bg-blue-300', 'bg-pink-300', 'bg-purple-300'];

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState<string>('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const savedNotes = localStorage.getItem('stickyNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
  }, [notes]);

  const createNote = useCallback(() => {
    if (!noteText.trim()) return;

    const newNote: Note = {
      id: uuidv4(),
      text: noteText,
      position: {
        top: Math.random() * (window.innerHeight - 200),
        left: Math.random() * (window.innerWidth - 200),
      },
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    setNoteText('');
  }, [noteText]);

  const deleteNote = useCallback((id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  }, []);

  const handleMouseDown = useCallback((
    event: React.MouseEvent<HTMLDivElement>,
    noteId: string
  ) => {
    event.preventDefault();
    setDraggingId(noteId);
    const noteElement = event.currentTarget;
    const rect = noteElement.getBoundingClientRect();
    setOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingId) return;

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === draggingId
          ? {
              ...note,
              position: {
                top: event.clientY - offset.y,
                left: event.clientX - offset.x,
              },
            }
          : note
      )
    );
  }, [draggingId, offset]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-100 p-8"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Sticky Note App</h1>

      <div className="text-center mb-6">
        <textarea
          className="w-80 h-24 p-3 border-2 border-gray-300 rounded-md resize-none"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write your note here..."
        />
        <div>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={createNote}
          >
            Add Note
          </button>
        </div>
      </div>

      <div id="noteContainer" className="relative w-full h-full">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`absolute p-4 ${note.color} w-48 h-48 rounded-lg shadow-lg cursor-move transition-shadow hover:shadow-xl`}
            style={{
              top: `${note.position.top}px`,
              left: `${note.position.left}px`,
              touchAction: 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
          >
            <button
              className="absolute top-1 right-1 text-gray-600 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(note.id);
              }}
            >
              ×
            </button>
            <p className="overflow-auto h-full">{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}