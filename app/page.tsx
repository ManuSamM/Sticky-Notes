'use client';

import { useState, MouseEvent } from "react";

interface Note {
  id: number;
  text: string;
  position: {
    top: number;
    left: number;
  };
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState<string>("");
  const [noteId, setNoteId] = useState<number>(0);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Function to create a new sticky note
  const createNote = () => {
    if (!noteText.trim()) return alert("Please enter some text!");

    const newNote: Note = {
      id: noteId,
      text: noteText,
      position: {
        top: Math.random() * window.innerHeight * 0.8, // Random position within the window
        left: Math.random() * window.innerWidth * 0.8,
      },
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    setNoteId((prevId) => prevId + 1);
    setNoteText(""); // Clear input
  };

  // Handle mouse down: Initiates the drag and captures the initial offset
  const handleMouseDown = (
    event: MouseEvent<HTMLDivElement>,
    noteId: number,
    note: Note
  ) => {
    setDraggingId(noteId);
    const notePosition = event.currentTarget.getBoundingClientRect();
    setOffset({
      x: event.clientX - notePosition.left,
      y: event.clientY - notePosition.top,
    });
  };

  // Handle mouse move: Only move the note if it is currently being dragged
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (draggingId === null) return;

    const newNotes = notes.map((note) =>
      note.id === draggingId
        ? {
            ...note,
            position: {
              top: event.clientY - offset.y,
              left: event.clientX - offset.x,
            },
          }
        : note
    );
    setNotes(newNotes);
  };

  // Handle mouse up: End the drag
  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div
      className="min-h-screen bg-gray-100 p-8"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Sticky Note App</h1>

      <div className="text-center mb-6">
        <textarea
          className="w-80 h-24 p-3 border-2 border-gray-300 rounded-md"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write your note here..."
        />
        <div>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
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
            className="absolute p-4 bg-yellow-300 w-48 h-48 rounded-lg shadow-lg cursor-move"
            style={{
              top: `${note.position.top}px`,
              left: `${note.position.left}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id, note)}
          >
            <p>{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
