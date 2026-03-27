import { useState, useRef, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Chip, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { v4 as uuidv4 } from 'uuid';
import type { FileAttachment } from '@/schemas/message';
import {formatFileSize} from '@/utils/format';

interface MessageInputProps {
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = text.trim().length > 0 || attachments.length > 0;

  const handleSend = () => {
    if (!hasContent) return;
    onSend(text.trim(), attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: FileAttachment[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) continue; // Skip large files silently
      const dataUrl = await readFileAsDataUrl(file);
      newAttachments.push({
        id: uuidv4(),
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };


  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', px: 2, pt: 1.5 }}>
          {attachments.map((att) => (
            <Chip
              key={att.id}
              icon={
                att.mimeType.startsWith('image/') ? (
                  <Box
                    component="img"
                    src={att.dataUrl}
                    sx={{ width: 20, height: 20, borderRadius: 0.5, objectFit: 'cover' }}
                  />
                ) : (
                  <InsertDriveFileIcon fontSize="small" />
                )
              }
              label={
                <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                  {att.name} ({formatFileSize(att.size)})
                </Typography>
              }
              onDelete={() => removeAttachment(att.id)}
              deleteIcon={<CloseIcon fontSize="small" />}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {/* Input row */}
      <Box sx={{ display: 'flex', gap: 0.5, p: 1.5, alignItems: 'flex-end' }}>
        <IconButton
          size="small"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          sx={{ mb: 0.25 }}
        >
          <AttachFileIcon fontSize="small" />
        </IconButton>
        <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileSelect} />
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          multiline
          maxRows={4}
        />
        <IconButton
            color="primary"
            onClick={handleSend}
            disabled={disabled || !hasContent}
            sx={{mb: 0.25}}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
