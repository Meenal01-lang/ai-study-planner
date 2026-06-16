import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { api } from '../services/api';
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  BookOpen, 
  FileText,
  Clock,
  Eye,
  Edit3
} from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  subject_id: number;
  subject?: {
    id: number;
    name: string;
    color: string;
  };
}

export const Notes: React.FC = () => {
  const { subjects } = useAppState();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubjectId, setEditSubjectId] = useState<number | ''>('');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);

  const loadNotes = async () => {
    try {
      const data = await api.notes.list();
      setNotes(data);
      if (data.length > 0 && !selectedNote) {
        handleSelectNote(data[0]);
      }
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content || '');
    setEditSubjectId(note.subject_id || '');
    setEditorMode('edit');
  };

  const handleCreateNote = async () => {
    if (subjects.length === 0) {
      alert('Please create a subject first before writing notes!');
      return;
    }
    
    try {
      const newNote = await api.notes.create({
        title: 'Untitled Note',
        content: 'Type your study notes here using Markdown formatting if desired...',
        subject_id: subjects[0].id
      });
      
      const refreshedNotes = await api.notes.list();
      setNotes(refreshedNotes);
      
      // Select the newly created note
      const created = refreshedNotes.find((n: Note) => n.id === newNote.id);
      if (created) {
        handleSelectNote(created);
      }
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote || !editTitle.trim()) return;
    setSaving(true);
    try {
      await api.notes.update(selectedNote.id, {
        title: editTitle.trim(),
        content: editContent,
        subject_id: editSubjectId ? Number(editSubjectId) : null
      });
      
      const refreshed = await api.notes.list();
      setNotes(refreshed);
      
      // Update local reference
      const match = refreshed.find((n: Note) => n.id === selectedNote.id);
      if (match) {
        setSelectedNote(match);
      }
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.notes.delete(selectedNote.id);
        const refreshed = await api.notes.list();
        setNotes(refreshed);
        if (refreshed.length > 0) {
          handleSelectNote(refreshed[0]);
        } else {
          setSelectedNote(null);
          setEditTitle('');
          setEditContent('');
          setEditSubjectId('');
        }
      } catch (err) {
        console.error('Failed to delete note', err);
      }
    }
  };

  // Filter notes based on query and selected subject tab
  const filteredNotes = notes.filter((note) => {
    const matchesQuery = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = 
      selectedSubjectFilter === null || note.subject_id === selectedSubjectFilter;
      
    return matchesQuery && matchesSubject;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto h-[calc(100vh-120px)] flex gap-8">
      
      {/* Index Sidebar Panel (Left) */}
      <div className="w-80 bg-card/60 border border-border rounded-2xl p-4 flex flex-col h-full">
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs"
            placeholder="Search notes..."
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* Subject filter row */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-border/80 scrollbar-thin">
          <button
            onClick={() => setSelectedSubjectFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 ${
              selectedSubjectFilter === null 
                ? 'bg-muted text-foreground border border-border' 
                : 'text-muted-foreground hover:text-foreground/90'
            }`}
          >
            All Notes
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectFilter(sub.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 border border-transparent ${
                selectedSubjectFilter === sub.id 
                  ? 'bg-purple-600/10 text-purple-400 border-purple-500/25' 
                  : 'text-muted-foreground hover:text-foreground/90'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Add Note Button */}
        <button
          onClick={handleCreateNote}
          className="w-full py-2 mb-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
        >
          <Plus className="w-4 h-4" /> Create Note
        </button>

        {/* Index list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <FileText className="w-8 h-8 text-muted-foreground/70 mb-2" />
              <p className="text-[11px] text-muted-foreground">No notes found.</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              const dateStr = new Date(note.updated_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              });
              
              return (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                    isSelected 
                      ? 'bg-muted border-purple-500/30' 
                      : 'bg-card/40 border-border hover:border-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-purple-400' : 'text-foreground'}`}>
                      {note.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground shrink-0 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {note.content?.replace(/[#*`$\\]/g, '') || 'Empty note...'}
                  </p>

                  {note.subject && (
                    <span 
                      className="text-[8px] px-1.5 py-0.5 rounded border self-start mt-1"
                      style={{ 
                        color: note.subject.color, 
                        borderColor: `${note.subject.color}20`,
                        backgroundColor: `${note.subject.color}05`
                      }}
                    >
                      {note.subject.name}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Note Editor Pane (Right) */}
      <div className="flex-1 bg-card/60 border border-border rounded-2xl p-6 flex flex-col h-full overflow-hidden">
        {selectedNote ? (
          <div className="flex-grow flex flex-col h-full">
            {/* Editor Toolbar Header */}
            <div className="flex flex-wrap justify-between items-center pb-4 border-b border-border mb-6 gap-4">
              {/* Title & Subject inputs */}
              <div className="flex-1 min-w-[200px] flex items-center gap-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-transparent border-0 font-outfit font-extrabold text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 p-0 flex-1 min-w-0"
                  placeholder="Note Title"
                />
                
                <select
                  value={editSubjectId}
                  onChange={(e) => setEditSubjectId(e.target.value ? Number(e.target.value) : '')}
                  className="px-2 py-1 rounded-lg bg-background border border-border focus:border-accent text-muted-foreground focus:outline-none text-[10px] w-32"
                >
                  <option value="">No subject...</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Mode toggle */}
                <div className="flex p-0.5 bg-background border border-border rounded-lg">
                  <button
                    onClick={() => setEditorMode('edit')}
                    className={`p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all ${
                      editorMode === 'edit' ? 'bg-muted text-purple-400' : ''
                    }`}
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditorMode('preview')}
                    className={`p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all ${
                      editorMode === 'preview' ? 'bg-muted text-purple-400' : ''
                    }`}
                    title="Preview Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-foreground font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                </button>
                
                <button
                  onClick={handleDeleteNote}
                  className="p-1.5 text-muted-foreground hover:text-red-400 rounded-xl hover:bg-red-500/5 border border-border hover:border-red-500/10 transition-all"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Content Area */}
            <div className="flex-1 overflow-y-auto">
              {editorMode === 'edit' ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-transparent border-0 text-foreground/90 placeholder:text-muted-foreground focus:outline-none focus:ring-0 p-0 text-xs resize-none leading-relaxed font-mono"
                  placeholder="Use Markdown to format your document:
# Header 1
## Header 2
- Bullet points
1. Numbered lists
$$ E=mc^2 $$ inline or display math equations."
                />
              ) : (
                <div className="prose prose-invert max-w-none text-xs text-foreground/90 space-y-4 leading-relaxed font-sans select-text whitespace-pre-wrap">
                  {/* Clean up basic markdown format for render */}
                  {editContent ? (
                    editContent
                      .split('\n')
                      .map((paragraph, index) => {
                        if (paragraph.startsWith('### ')) {
                          return <h5 key={index} className="font-outfit font-extrabold text-sm text-foreground mt-4">{paragraph.replace('### ', '')}</h5>;
                        }
                        if (paragraph.startsWith('## ')) {
                          return <h4 key={index} className="font-outfit font-extrabold text-base text-foreground mt-4">{paragraph.replace('## ', '')}</h4>;
                        }
                        if (paragraph.startsWith('# ')) {
                          return <h3 key={index} className="font-outfit font-extrabold text-lg text-foreground mt-4">{paragraph.replace('# ', '')}</h3>;
                        }
                        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                          return <li key={index} className="list-disc pl-4 text-foreground/90 mt-1">{paragraph.replace(/^[-*]\s+/, '')}</li>;
                        }
                        return <p key={index} className="text-muted-foreground">{paragraph}</p>;
                      })
                  ) : (
                    <span className="text-muted-foreground italic">No content.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <BookOpen className="w-12 h-12 text-muted-foreground/70 mb-3" />
            <div className="font-outfit font-bold text-foreground/90 text-sm">Select or Create a Study Document</div>
            <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
              Select an existing study note file from the left sidebar index or create a new document to write down formulas, definitions, and syllabus reference targets.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
