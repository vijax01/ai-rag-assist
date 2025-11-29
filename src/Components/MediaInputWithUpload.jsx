import React, { useRef, useState, useEffect } from "react";

/**
 * MediaInputWithUpload
 * A responsive React + Tailwind input component that supports:
 * - clicking the left "plus" to open file picker
 * - pasting images or videos (from clipboard)
 * - shows upload state (uploading -> done)
 * - shows preview thumbnail, with pencil (edit caption) and delete icons
 * - allows typing text prompt while/after media uploads
 *
 * Props:
 * - onUploadComplete(file: File, previewUrl: string): void  // called when each media "finishes uploading"
 * - maxFiles: number (default 5)
 * - placeholder: string
 *
 * Usage: import MediaInputWithUpload from './MediaInputWithUpload.jsx'
 * <MediaInputWithUpload onUploadComplete={(f,u)=>console.log(f,u)} />
 */

export default function MediaInputWithUpload({ onUploadComplete, maxFiles = 5, placeholder = "Write a prompt or paste media..." }) {
  const fileInputRef = useRef(null);
  const [items, setItems] = useState([]); // { id, file, preview, type, status: 'uploading'|'done', caption }
  const [text, setText] = useState("");

  // Keep a ref to items so we can revoke object URLs on unmount only (avoid revoking previews when items change)
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items; // keep ref in sync
  }, [items]);

  useEffect(() => {
    return () => {
      // revoke any remaining object URLs when component unmounts
      (itemsRef.current || []).forEach((it) => {
        try { URL.revokeObjectURL(it.preview); } catch (e) { /* ignore */ }
      });
    };
  }, []);

  function handleFiles(files) {
    const arr = Array.from(files).slice(0, Math.max(0, maxFiles - items.length));
    if (arr.length === 0) return;

    // create placeholder items immediately so UI shows uploading slots
    const placeholders = arr.map((file) => {
      const id = Math.random().toString(36).slice(2, 9);
      const typeGuess = file.type ? (file.type.startsWith("video") ? "video" : file.type.startsWith("image") ? "image" : "file") : "file";
      return { id, file, preview: null, type: typeGuess, status: "uploading", caption: "" };
    });

    setItems((prev) => [...prev, ...placeholders]);

    // helper to read file as data URL (more reliable for pasted clipboard data than object URLs)
    const readAsDataURL = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('file read error'));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    placeholders.forEach(async (ph) => {
      try {
        const dataUrl = await readAsDataURL(ph.file);
        // detect type from dataUrl fallback
        const type = ph.file.type || (typeof dataUrl === 'string' && dataUrl.startsWith('data:video') ? 'video' : (typeof dataUrl === 'string' && dataUrl.startsWith('data:image') ? 'image' : 'file'));

        // update this item with preview dataUrl
        setItems((prev) => prev.map((p) => p.id === ph.id ? { ...p, preview: dataUrl, type: type.startsWith('video') ? 'video' : type.startsWith('image') ? 'image' : 'file' } : p));

        // simulate upload completion after preview is ready
        await fakeUpload(ph.file);
        setItems((prev) => prev.map((p) => (p.id === ph.id ? { ...p, status: 'done' } : p)));
        if (onUploadComplete) onUploadComplete(ph.file, dataUrl);
      } catch (err) {
        // if reading fails, mark as file (no preview)
        setItems((prev) => prev.map((p) => (p.id === ph.id ? { ...p, preview: null, status: 'done' } : p)));
      }
    });
  }

  function fakeUpload(file) {
    // Replace this with real upload logic (fetch / xhr / tus / s3 SDK...)
    return new Promise((res) => setTimeout(res, 800 + Math.random() * 1200));
  }

  function onPlusClick() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(e) {
    handleFiles(e.target.files);
    e.target.value = null; // reset
  }

  function handlePaste(e) {
    const itemsClip = e.clipboardData && Array.from(e.clipboardData.items || []);
    if (!itemsClip) return;
    const files = [];
    itemsClip.forEach((it) => {
      if (it.kind === "file") {
        const file = it.getAsFile();
        if (file && (file.type.startsWith("image") || file.type.startsWith("video"))) files.push(file);
      }
    });
    if (files.length) {
      e.preventDefault();
      handleFiles(files);
    }
  }

  function handleDelete(id) {
    setItems((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  function toggleEditCaption(id) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, editing: !p.editing } : p)));
  }

  function updateCaption(id, value) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, caption: value } : p)));
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-4">
      <div className="flex items-start gap-3 p-2 border rounded-lg bg-white shadow-sm">
        {/* + icon and file input */}
        <div className="shrink-0"> { /* earlier it was flex-shrink-0 */ }
          <button
            aria-label="Add media"
            onClick={onPlusClick}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-dashed border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-300 cursor-pointer"
            title="Add media (click or paste)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={handleFileInputChange}
          />
        </div>

        {/* input + previews */}
        <div className="flex-1">
          <div
            onPaste={handlePaste}
            className="min-h-[54px] p-2 rounded-md border border-transparent focus-within:border-slate-300"
          >
            {/* Previews row */}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-2">
                {items.map((it) => (
                  <div key={it.id} className="relative w-28 h-20 rounded-md overflow-hidden border bg-gray-50 dark:bg-slate-700">
                    {it.type === "image" ? (
                      <img src={it.preview} alt="preview" className="object-cover w-full h-full" />
                    ) : it.type === "video" ? (
                      <video src={it.preview} className="object-cover w-full h-full" muted />
                    ) : (
                      <div className="flex items-center justify-center h-full">File</div>
                    )}

                    {/* status overlay */}
                    {it.status === "uploading" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-xs text-white">Uploading...</div>
                      </div>
                    )}

                    {/* controls */}
                    <div className="absolute right-1 top-1 flex gap-1">
                      <button
                        onClick={() => toggleEditCaption(it.id)}
                        className="p-1 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm cursor-pointer"
                        title="Edit caption"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2 2 0 0 0-2.828-2.828L5.172 17.172A2 2 0 0 0 4 18.586V20z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="p-1 rounded-full bg-white/80 hover:bg-white text-red-600 shadow-sm cursor-pointer"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 7L5 7M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
                        </svg>
                      </button>
                    </div>

                    {/* caption edit */}
                    {it.editing && (
                      <div className="absolute left-0 right-0 bottom-0 p-1 bg-gray-400/90 text-white">
                        <input
                          value={it.caption}
                          onChange={(e) => updateCaption(it.id, e.target.value)}
                          placeholder="caption"
                          className="w-full text-xs text-white p-1 rounded border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* text input */}
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="w-full resize-none bg-transparent text-black outline-none text-base placeholder-gray-600 dark:placeholder-gray-400"
            />
          </div>

          {/* helper row: file count, simple send button */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div>{items.length}/{maxFiles} media</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // one possible action: clear all
                  setItems((prev) => {
                    prev.forEach((p) => URL.revokeObjectURL(p.preview));
                    return [];
                  });
                }}
                className="text-xs px-2 py-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Clear
              </button>

              <button
                onClick={() => alert('Send: ' + text + '\nMedia: ' + items.length)}
                className="px-3 py-1 rounded cursor-pointer bg-purple-600 text-white text-sm hover:bg-purple-800"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
