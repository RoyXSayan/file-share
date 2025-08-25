import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Copy, X } from "lucide-react";

export default function FileDialog({ open, onClose, file }) {
  if (!file) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(file.url);
    alert("✅ Link copied!");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl max-w-md mx-auto p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-white tracking-wide">
            File Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center gap-4 mt-3">
          {/* File Preview / Icon */}
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
            <span className="text-lg font-bold">{file.name[0].toUpperCase()}</span>
          </div>

          {/* File Info */}
          <div>
            <p className="text-white text-lg font-medium">{file.name}</p>
            <p className="text-gray-300 text-sm mt-1">Uploaded {file.date}</p>
          </div>

          {/* Copy Link Box */}
          <div className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 flex justify-between items-center">
            <p className="truncate text-gray-200 text-sm">{file.url}</p>
            <button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <DialogFooter className="flex justify-center gap-3 mt-4">
          <button
            onClick={onClose}
            variant="secondary"
            className="bg-gray-200 hover:bg-gray-300 text-black rounded-xl px-4"
          >
            <X className="w-4 h-4 mr-1" /> Close
          </button>
          <button
            onClick={handleCopy}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white rounded-xl px-4 shadow-lg"
          >
            <Copy className="w-4 h-4 mr-1" /> Copy Link
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
