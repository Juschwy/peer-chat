<table>
    <tr>
        <td>
            <h2>⚠️ Attention ⚠️</h2>
            <h1>AI Generated Code (also known as slop)</h1>
            <p>The code in this repository was completely AI generated and does not follow best practises in any form.</p>
        </td>
    </tr>
</table>

# Peer Chat

A decentralized peer-to-peer chat application built with React, TypeScript, PeerJS, and Material UI. No servers, no accounts system — just direct browser-to-browser connections.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Format code
npm run format
```

---

## 🧱 Tech Stack

| Tool                   | Purpose                        |
| ---------------------- | ------------------------------ |
| React 19               | UI framework                   |
| TypeScript             | Type safety                    |
| Vite                   | Build tool & dev server        |
| @tanstack/react-router | File-based routing             |
| Zustand                | Global state management        |
| Zod                    | Schema validation              |
| @mui/material          | UI component library           |
| @emotion/react/styled  | CSS-in-JS (MUI dependency)     |
| PeerJS                 | WebRTC peer-to-peer messaging  |
| uuid                   | Unique ID generation           |
| ESLint + Prettier      | Code quality & formatting      |

---

## 📁 Project Structure

```
src/
  App.tsx                 # Root app component (router provider)
  main.tsx                # Entry point (theme, notifications, render)
  index.css               # Global CSS reset

  schemas/                # Zod schemas & TypeScript types
    account.ts            # Account schema
    contact.ts            # Contact schema
    message.ts            # Message schema
    peerMessage.ts        # PeerJS message protocol schema
    index.ts              # Barrel exports

  store/                  # Zustand global state
    chatStore.ts          # State, actions, BroadcastChannel sync
    index.ts

  storage/                # Storage adapter pattern
    StorageAdapter.ts     # Generic interface
    LocalStorageAdapter.ts# LocalStorage implementation (account)
    IndexedDBAdapter.ts   # IndexedDB implementation (messages, contacts)
    index.ts              # Pre-configured adapter instances

  connection/             # PeerJS connection layer
    ConnectionManager.ts  # Peer lifecycle, messaging, ping, reconnect
    index.ts

  hooks/                  # Custom React hooks
    notificationContext.ts# Notification context + useNotification hook
    useNotification.tsx   # NotificationProvider component (snackbar queue)
    useConnection.ts      # PeerJS connection lifecycle hook
    useTabLeader.ts       # Multi-tab leader election via BroadcastChannel
    index.ts

  components/             # UI components
    UserAvatar.tsx        # Avatar with initials fallback
    OnlineAvatar.tsx      # Avatar with online/offline badge
    MessageBubble.tsx     # Single message bubble (own=right, other=left)
    MessageInput.tsx      # Text input with Enter-to-send
    MessageList.tsx       # Scrollable message list with auto-scroll
    ContactListItem.tsx   # Sidebar contact row (last msg preview, unread count)
    AddContactDialog.tsx  # Dialog to add contact by Peer ID
    ProfileDialog.tsx     # Profile dialog with copy-to-clipboard Peer ID
    AppHeader.tsx         # Top bar (app name, connection status, profile)
    Sidebar.tsx           # Left sidebar (contact list, add contact button)
    ChatArea.tsx          # Right chat panel (header, messages, input)
    EmptyChatArea.tsx     # Placeholder when no chat selected
    RootLayout.tsx        # Root layout (header + outlet, redirect logic)
    RegisterPage.tsx      # Registration page (username input)
    ChatsLayout.tsx       # Chats layout (sidebar + outlet)
    ChatPage.tsx          # Individual chat route component
    index.ts

  routes/                 # TanStack Router route definitions
    root.tsx              # Root route
    register.tsx          # /register route
    chats.tsx             # /chats route + index
    chat.tsx              # /chats/$chatId route
    router.ts             # Router instance + route tree
    index.ts

  utils/                  # Utility functions
    avatar.ts             # getInitials, stringToColor
    index.ts

  types/                  # (Reserved for future type definitions)
  assets/                 # Static assets
```

---

## 🧠 Architecture

### Global State (Zustand)

- **Single source of truth** for account, contacts, and messages
- Every mutation automatically **persists to storage** (write-through)
- **BroadcastChannel** syncs state across browser tabs

### Storage Layer (Adapter Pattern)

| Data     | Backend      | Adapter              |
| -------- | ------------ | -------------------- |
| Account  | LocalStorage | `LocalStorageAdapter` |
| Contacts | IndexedDB    | `IndexedDBAdapter`    |
| Messages | IndexedDB    | `IndexedDBAdapter`    |

All adapters implement a common `StorageAdapter<T>` interface with `get`, `set`, `remove`, `getAll`, and `query` methods.

### Multi-Tab Handling

- **Leader election** via `BroadcastChannel` ensures only one tab runs the PeerJS connection
- Non-leader tabs show an "Inactive tab" warning chip
- State changes are broadcast and synced across all tabs

### PeerJS Connection Layer

The `ConnectionManager` singleton handles:
- Peer instance lifecycle (create, destroy, reconnect)
- Incoming/outgoing connections
- Message protocol enforcement
- Ping system for online/offline detection
- Connection pooling (reuse existing connections)

---

## 📡 Message Protocol

All PeerJS messages follow:

```json
{
  "type": "MESSAGE_SEND",
  "content": { ... }
}
```

### Allowed Types

| Type                      | Direction | Purpose                          |
| ------------------------- | --------- | -------------------------------- |
| `PING`                    | Both      | Heartbeat / online detection     |
| `MESSAGE_SEND`            | Outgoing  | Send a chat message              |
| `MESSAGE_RETURN_RECEIVED` | Response  | Acknowledge message received     |
| `MESSAGE_RETURN_READ`     | Response  | Acknowledge message read         |
| `MESSAGE_RETURN_INVALID`  | Response  | Report invalid message to sender |

---

## 🧾 Data Models

### Message
```
id: string (uuid)
senderId: string
receiverId: string
sentTimestamp: Date
receivedTimestamp?: Date   ← set when remote receives
readTimestamp?: Date       ← set when remote reads
textContent: string
```

### Contact
```
id: string          ← Peer ID
name: string
avatar: string
publicKey: string
```

### Account
```
id: string          ← UUID (used as Peer ID)
name: string
privateKey: string  ← reserved for future encryption
```

---

## ✅ Validation

**Zod validates everything:**
- Incoming PeerJS messages (envelope + content)
- Outgoing messages before send
- Storage reads on initialization

**On invalid data:**
- Global snackbar notification shown
- `MESSAGE_RETURN_INVALID` sent to remote peer
- Invalid messages are **never stored**

---

## 🔄 Message Flow

### Sending
1. Create message with UUID + timestamps
2. Validate with Zod
3. Store in Zustand state → persists to IndexedDB
4. Send via PeerJS connection

### Receiving
1. Validate incoming envelope (PeerMessageSchema)
2. Validate content (MessageSchema)
3. Store message with `receivedTimestamp`
4. Send `MESSAGE_RETURN_RECEIVED` acknowledgement
5. When chat opened → send `MESSAGE_RETURN_READ`

### Status (no explicit field)
- `sentTimestamp` only → Sent (⏳)
- `receivedTimestamp` set → Delivered (✓)
- `readTimestamp` set → Read (✓✓)

---

## 🧭 Routes

| Route            | Component      | Description              |
| ---------------- | -------------- | ------------------------ |
| `/`              | Redirect       | → `/chats`               |
| `/register`      | RegisterPage   | Create account           |
| `/chats`         | EmptyChatArea  | Contact list, no chat    |
| `/chats/$chatId` | ChatArea       | Active chat conversation |

**Auth guard:** If no account exists, redirect to `/register`.

---

## 🎨 UI

- **Material UI only** — no custom CSS beyond the global reset
- **Fixed sidebar** (320px) with contacts sorted by last message
- **Chat area** with message bubbles (own=right, other=left)
- **Avatar fallback** with colored initials from name
- **Online/offline badges** on avatars
- **Unread count** badges on contact list items
- **Global snackbar** notification queue

---

## 🛠️ Implementation Plan (Completed)

1. ✅ Setup dependencies + tooling (Vite, TS, ESLint, Prettier, absolute imports)
2. ✅ Setup TanStack Router (root, register, chats, chat routes)
3. ✅ Setup Zustand store + write-through persistence middleware
4. ✅ Implement storage adapters (LocalStorage + IndexedDB)
5. ✅ Define Zod schemas (Message, Contact, Account, PeerMessage)
6. ✅ Build connection layer (ConnectionManager singleton)
7. ✅ Implement message protocol (PING, SEND, RECEIVED, READ, INVALID)
8. ✅ Build UI layout (AppHeader, Sidebar, ChatArea, EmptyChatArea)
9. ✅ Implement chat features (send/receive, read receipts, message history)
10. ✅ Add notifications (global snackbar queue via React Context)
11. ✅ Add multi-tab sync (BroadcastChannel state sync + leader election)

---

## 🚫 Non-Goals

- No backend server
- No authentication system
- No unit/integration tests

---

## 🔮 Future-Ready

The architecture is designed to support:
- **File transfer** — extend message protocol with new types
- **Audio/video calls** — PeerJS already supports media streams
- **End-to-end encryption** — `privateKey`/`publicKey` fields are reserved
- **Group chats** — extend Contact and Message schemas

---

## 📝 License

Private project.
