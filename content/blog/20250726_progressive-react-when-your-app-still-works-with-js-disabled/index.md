---
  slug: "/posts/progressive-react-when-your-app-still-works-with-js-disabled/"
  date: 2025-07-26 19:37
  title: "Progressive React: When Your App Still Works with JS Disabled"
  draft: false
  description: "Exploring how React Router 7 brings progressive enhancement back to React apps, making them work seamlessly with JavaScript disabled while embracing modern web standards."
  categories: ["React", "Web Standards", "Progressive Enhancement"]
  keywords: ["React Router 7", "Remix", "Progressive Enhancement", "SSR", "Web Standards"]
---

In the last year, I worked extensively with Remix and React Router 7, and I have to say it was a genuinely pleasant experience. If you're a seasoned web developer like me—someone who was there when AJAX was becoming a thing and struggled to make websites work both with and without JavaScript enabled—you'll really appreciate the evolution of React Router.

To demonstrate these concepts, I built a Matrix chat application that works perfectly with JavaScript disabled. **You can try it yourself at [https://matrix-chat.fly.dev](https://matrix-chat.fly.dev)** - disable JavaScript in your browser and see how all the core functionality still works: registration, login, room creation, browsing rooms, and sending messages. Then re-enable JavaScript to experience the enhanced real-time features.

## The Philosophy: Back to Web Fundamentals

There's something profoundly satisfying about building applications that embrace web standards rather than fighting against them. React Router 7 represents a return to the core principle of progressive enhancement: start with a solid foundation that works for everyone, then layer on enhancements for those who can benefit from them.

This philosophy isn't new—it's as old as the web itself. HTML provides structure, CSS provides presentation, and JavaScript provides behavior. The magic happens when these technologies work together harmoniously, with each layer gracefully degrading when the next isn't available.

Modern React development, especially with server-side rendering and React Server Components, is essentially a sophisticated evolution of this principle. We're not abandoning the separation of concerns; we're redefining what those concerns are. Instead of separating HTML, CSS, and JavaScript, we're now separating server and client responsibilities. 


## About the Matrix Protocol

For this project, I didn't want to build a chat backend from scratch—I just needed a backend-for-frontend. So I leveraged the Matrix Protocol (https://matrix.org/), an open standard for real-time communication. This meant I could simply run a Docker image to have a fully functional chat server available.

Matrix is particularly interesting for this demonstration because it provides a real-world API that supports both REST endpoints and real-time features. This gives us the perfect opportunity to showcase how React Router 7 handles both traditional form submissions (which work without JavaScript) and enhanced real-time features (which require JavaScript for polling or WebSocket connections).


## React Router 7: The Bridge Between Server and Client

If you're already familiar with React Router or Remix, feel free to skip this section—but if you're new to this paradigm, understanding these concepts is crucial to appreciating the progressive enhancement approach.

### The Anatomy of a Route

In React Router 7, a route is a file that contains everything needed for a page. Think of it as a complete page definition with three key parts:

- **`loader`** → Executes on the server when the page is accessed with a GET request
- **`action`** → Executes on the server when the page receives non-GET requests (POST, DELETE, etc.)
- **`default export`** → The UI component that renders both server-side and client-side

### Server vs. Client Execution

Here's where it gets interesting: everything runs on the server first, except for React's `useEffect` hooks. The default export (your React component) runs in both environments, but with an important distinction:

1. **Server-side**: Everything executes except `useEffect` hooks
2. **Client-side**: The component is hydrated with server data, then `useEffect` hooks execute

This dual execution model is what enables progressive enhancement—your app works completely without JavaScript, but gains enhanced interactivity when JavaScript is available.

### A Practical Example

```typescript
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";

// Runs on server for GET requests
export async function loader({ params }: LoaderFunctionArgs) {
  const messages = await fetchMessages(params.roomId);
  return json({ messages });
}

// Runs on server for POST/PUT/DELETE requests
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = formData.get("message");
  await sendMessage(message);
  return json({ success: true });
}

// Runs on both server and client
export default function ChatRoom() {
  const { messages } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  
  // This runs on both server and client
  console.log("Rendering chat room");
  
  // This ONLY runs on the client
  useEffect(() => {
    console.log("Setting up real-time polling");
    const interval = setInterval(pollForNewMessages, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="messages">
        {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
      </div>
      
      {/* This form works with or without JavaScript */}
      <Form method="post">
        <input name="message" placeholder="Type a message..." />
        <button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "Sending..." : "Send"}
        </button>
      </Form>
    </div>
  );
}
```

### Key Components and Hooks

React Router provides several crucial components that enable progressive enhancement:

- **`<Form>`** → Creates forms that work both with and without JavaScript
- **`<Link>`** → Navigation that enhances to client-side routing when JavaScript is available
- **`useLoaderData()`** → Access server-loaded data
- **`useNavigation()`** → Track form submission and navigation states for enhanced UX



## Progressive Enhancement in Practice

The beauty of this approach becomes clear when you see how fundamental web features are handled. Let's examine how key functionality works both with and without JavaScript:

### Without JavaScript: Pure Web Standards

When JavaScript is disabled, the chat application still works because it relies on fundamental web technologies:

- **Forms submit via HTTP POST** → Messages are sent using standard form submission
- **Navigation uses HTTP GET** → Links work as traditional page navigations  
- **Server-side rendering** → Every page loads with complete HTML content
- **CSS provides styling** → The interface remains fully styled and usable

### With JavaScript: Enhanced Experience

When JavaScript is available, the same foundation gets enhanced:

- **Forms become AJAX calls** → Smooth, in-page submission without full page reloads
- **Navigation becomes client-side routing** → Instant page transitions
- **Real-time updates** → Polling or WebSocket connections for live message updates
- **Loading states** → Visual feedback during form submissions and navigation

### Feature Comparison: Matrix Chat Implementation

| Feature | Traditional SPA Approach | React Router 7 Approach |
|---------|-------------------------|-------------------------|
| **Login/Register** | Form submission blocked, AJAX call, manual redirect handling | `<Form>` component, server `action`, automatic redirect |
| **Create Room** | Client-side form submission, loading states, error handling | Server `action` with built-in validation and redirect |
| **Search Rooms** | Debounced client-side search, manual state management | URL-based search with server `loader`, automatic caching |
| **Room Messages** | useEffect fetch, manual polling, complex state sync | Server `loader` + client-side polling with `useEffect` |

## Implementation Deep Dive

Let's examine how each feature was implemented using React Router 7 patterns, showing the actual code that makes progressive enhancement work.

### Login/Register

The authentication system demonstrates the power of `action` functions and progressive form handling. The same form works with and without JavaScript:

```typescript
// app/routes/login.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await getTokenFromCookie(cookieHeader);
  
  // Redirect if already authenticated
  if (token) {
    return redirect("/");
  }
  
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const username = formData.get("username");
  const password = formData.get("password");

  if (intent === "login") {
    const response = await fetch(`${matrixUrl}/_matrix/client/v3/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "m.login.password",
        user: username,
        password: password,
      }),
    });

    if (response.ok) {
      const { access_token } = await response.json();
      
      return redirect("/", {
        headers: {
          "Set-Cookie": await createUserSession(access_token),
        },
      });
    }
  }

  return json({ error: "Invalid credentials" });
}

export default function Login() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      
      <button name="intent" value="login" type="submit" 
              disabled={navigation.state === "submitting"}>
        {navigation.state === "submitting" ? "Signing in..." : "Sign In"}
      </button>
      
      <button name="intent" value="register" type="submit">
        Register
      </button>
      
      {actionData?.error && <p className="error">{actionData.error}</p>}
    </Form>
  );
}
```

**Why this works progressively:**
- **Without JS**: Form submits via HTTP POST, page refreshes with results
- **With JS**: Enhanced with loading states and no page refresh
- **Server-side**: Authentication logic runs on the server, cookies are secure

### Create Room

Room creation shows how server actions can handle complex API integrations while maintaining form simplicity:

```typescript
// app/routes/createroom.tsx
export async function action({ request }: ActionFunctionArgs) {
  const token = await requireUserSession(request);
  const formData = await request.formData();
  
  const roomName = formData.get("roomName");
  const topic = formData.get("topic");
  const isPublic = formData.get("visibility") === "public";

  try {
    const response = await fetch(`${matrixUrl}/_matrix/client/v3/createRoom`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roomName,
        topic: topic,
        visibility: isPublic ? "public" : "private",
        preset: isPublic ? "public_chat" : "private_chat",
      }),
    });

    if (response.ok) {
      const { room_id } = await response.json();
      return redirect(`/room/${room_id}`);
    }
  } catch (error) {
    return json({ error: "Failed to create room" });
  }
}

export default function CreateRoom() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <input name="roomName" placeholder="Room Name" required />
      <textarea name="topic" placeholder="Room Topic" />
      
      <select name="visibility">
        <option value="private">Private</option>
        <option value="public">Public</option>
      </select>
      
      <button type="submit" disabled={navigation.state === "submitting"}>
        {navigation.state === "submitting" ? "Creating..." : "Create Room"}
      </button>
      
      {actionData?.error && <p className="error">{actionData.error}</p>}
    </Form>
  );
}
```

**Progressive enhancement benefits:**
- **Server validation**: Input validation happens on the server first
- **Automatic redirect**: No manual navigation handling required
- **Error handling**: Built-in error states without try/catch blocks

### Search Rooms

Room search demonstrates URL-driven state management that works perfectly without JavaScript:

```typescript
// app/routes/browse.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requireUserSession(request);
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter");
  
  const body: any = { limit: 100 };
  if (filter) {
    body.filter = { generic_search_term: filter };
  }

  const response = await fetch(`${matrixUrl}/_matrix/client/v3/publicRooms`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const { chunk: rooms } = await response.json();
  return json({ rooms, filter });
}

export default function Browse() {
  const { rooms, filter } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div>
      <Form method="get">
        <input 
          name="filter" 
          placeholder="Search rooms..." 
          defaultValue={filter || ""} 
        />
        <button type="submit">Search</button>
      </Form>

      {navigation.state === "loading" && <p>Searching...</p>}
      
      <div className="rooms">
        {rooms.map(room => (
          <Link key={room.room_id} to={`/room/${room.room_id}`}>
            <h3>{room.name || room.canonical_alias}</h3>
            <p>{room.topic}</p>
            <span>{room.num_joined_members} members</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**URL-driven state advantages:**
- **Bookmarkable searches**: Share filtered results via URL
- **Back button works**: Browser navigation handles search history
- **Server-side filtering**: Fast initial page loads with filtered results

### Room Messages and Real-time Updates

The room page shows the perfect blend of server-side data loading and client-side enhancement:

```typescript
// app/routes/room.tsx
export async function loader({ params, request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await matrixTokenCookie.parse(cookieHeader);
  const baseUrl = await matrixBaseUrlCookie.parse(cookieHeader);
  
  if (!token || !baseUrl) {
    throw redirect("/login");
  }

  const roomId = params.roomId;
  
  // Fetch room details
  const roomResponse = await fetch(`${baseUrl}/_matrix/client/v3/rooms/${roomId}/state/m.room.name`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  // Fetch initial messages
  const messagesResponse = await fetch(
    `${baseUrl}/_matrix/client/v3/rooms/${roomId}/messages?dir=b&limit=20`,
    {
      headers: { "Authorization": `Bearer ${token}` }
    }
  );
  
  const roomData = await roomResponse.json();
  const messagesData = await messagesResponse.json();
  
  // Convert Matrix events to our Message format
  const messages = messagesData.chunk
    .filter((event: any) => event.type === "m.room.message")
    .map((event: any) => ({
      id: event.event_id,
      sender: event.sender,
      body: event.content.body,
      timestamp: new Date(event.origin_server_ts)
    }))
    .reverse();

  return {
    room: { id: roomId, name: roomData.name || roomId },
    messages,
    matrixConfig: { token, baseUrl }
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await matrixTokenCookie.parse(cookieHeader);
  const baseUrl = await matrixBaseUrlCookie.parse(cookieHeader);
  
  const formData = await request.formData();
  const message = formData.get("message");
  
  const response = await fetch(
    `${baseUrl}/_matrix/client/v3/rooms/${params.roomId}/send/m.room.message/${Date.now()}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msgtype: "m.text",
        body: message,
      }),
    }
  );
  
  return { success: response.ok };
}

export default function Room() {
  const { room, messages: initialMessages, matrixConfig } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  
  // Custom hook for Matrix synchronization - this is where the magic happens!
  const { messages, isConnected, error } = useMatrixSync({
    roomId: room.id,
    initialEvents: initialMessages,  // Server-provided initial data
    token: matrixConfig.token,
    baseUrl: matrixConfig.baseUrl
  });

  return (
    <div>
      <div className="room-header">
        <h1>{room.name}</h1>
        <div className="connection-status">
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>
      
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.sender}</strong>: {message.body}
            <time>{message.timestamp.toLocaleTimeString()}</time>
          </div>
        ))}
      </div>
      
      <Form method="post">
        <input 
          name="message" 
          type="text" 
          placeholder="Type a message..." 
          required 
          disabled={navigation.state === "submitting"}
        />
        <button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "Sending..." : "Send"}
        </button>
      </Form>
      
      {error && <div className="error">Connection error: {error}</div>}
    </div>
  );
}
```

Now, here's the crucial part - the custom `useMatrixSync` hook:

```typescript
// app/hooks/useMatrixSync.ts
export function useMatrixSync({ roomId, initialEvents, token, baseUrl }: {
  roomId: string;
  initialEvents: Message[];
  token: string;
  baseUrl: string;
}) {
  const [messages, setMessages] = useState(initialEvents);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // This runs on both server and client, but the initial messages 
  // are provided by the server loader
  console.log("useMatrixSync: Setting up with", initialEvents.length, "initial messages");
  
  useEffect(() => {
    // This ONLY runs on the client side - perfect for real-time sync!
    console.log("useMatrixSync: Starting client-side sync for room", roomId);
    
    let syncToken: string | null = null;
    let abortController = new AbortController();
    
    async function sync() {
      try {
        const syncUrl = new URL(`${baseUrl}/_matrix/client/v3/sync`);
        syncUrl.searchParams.set("timeout", "30000");
        syncUrl.searchParams.set("filter", JSON.stringify({
          room: { rooms: [roomId] }
        }));
        
        if (syncToken) {
          syncUrl.searchParams.set("since", syncToken);
        }
        
        const response = await fetch(syncUrl.toString(), {
          headers: { "Authorization": `Bearer ${token}` },
          signal: abortController.signal
        });
        
        if (response.ok) {
          const syncData = await response.json();
          setIsConnected(true);
          setError(null);
          
          // Process new messages
          const roomData = syncData.rooms?.join?.[roomId] || syncData.rooms?.timeline?.[roomId];
          if (roomData?.timeline?.events) {
            const newMessages = roomData.timeline.events
              .filter((event: any) => event.type === "m.room.message")
              .map((event: any) => ({
                id: event.event_id,
                sender: event.sender,
                body: event.content.body,
                timestamp: new Date(event.origin_server_ts)
              }));
            
            setMessages(current => [...current, ...newMessages]);
          }
          
          syncToken = syncData.next_batch;
          // Continue syncing
          setTimeout(sync, 100);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setIsConnected(false);
          setError(error.message);
          // Retry after delay
          setTimeout(sync, 5000);
        }
      }
    }
    
    sync();
    
    return () => {
      abortController.abort();
    };
  }, [roomId, token, baseUrl]);
  
  return { messages, isConnected, error };
}
```

**The Custom Hook Magic: Server-Side Execution**

Here's the fascinating part about the `useMatrixSync` hook that perfectly demonstrates React Router 7's dual execution model:

```typescript
// This part runs on BOTH server and client
const [messages, setMessages] = useState(initialEvents);  // ✅ Server & Client
console.log("Setting up with", initialEvents.length, "initial messages");  // ✅ Server & Client

// This part runs ONLY on the client  
useEffect(() => {  // ❌ Server (skipped), ✅ Client only
  console.log("Starting client-side sync");
  // All the real-time synchronization logic
}, [roomId]);
```

**Why the hook accepts `initialEvents`:**

The custom hook needs `initialEvents` from the loader because when it runs on the server during SSR, the `useEffect` won't execute. The server-side execution only initializes the state with the data we fetched in the loader. Then, when the component hydrates on the client, the `useEffect` kicks in and starts the real-time synchronization from where the server left off.

This creates a seamless handoff:
1. **Server**: Fetches initial messages, passes them to the hook, hook initializes state
2. **Client**: Hook hydrates with server state, then `useEffect` begins real-time sync
3. **Result**: No gap in data, no loading states, perfect progressive enhancement

**Perfect progressive enhancement:**
- **Server-side**: Initial messages load immediately, forms work without JS
- **Client-side**: Real-time updates and enhanced UX when JS is available  
- **Graceful degradation**: If polling fails, manual refresh still works
- **Hook design**: Accepts server data to bridge server-client execution seamlessly

## The Evolution of Separation of Concerns

Here's where things get philosophically interesting. The traditional "separation of concerns" in web development meant separating technologies: HTML in one file, CSS in another, JavaScript in a third. We were taught that mixing these was evil—it created "spaghetti code" that was hard to maintain.

But React and modern frameworks challenged this thinking. Instead of separating by technology, we began separating by feature or component. A button component might contain its HTML structure, CSS styling, and JavaScript behavior all in one place. This felt wrong at first, but it proved to be more maintainable for complex applications.

React Router 7 and React Server Components represent the next evolution: separating by execution environment. We're not just thinking about what runs where, but when it runs and why. This creates a new kind of separation of concerns:

- **Server concerns**: Data fetching, authentication, business logic, initial rendering
- **Client concerns**: User interactions, real-time updates, enhanced UX, local state

This isn't abandoning separation of concerns—it's refining what those concerns actually are. We're returning to the web's original progressive enhancement model, but with modern tools that make it sustainable and developer-friendly.

## Why This Matters for Backend-for-Frontend

In the past, when I built React apps with a separate backend-for-frontend (often in PHP), I had to:

- Manually configure Webpack to split code by route
- Manually type every HTTP call 
- Keep frontend and backend logic in sync across different languages
- Handle loading states, error states, and form submissions in every component

React Router 7 eliminates this friction. The loader and action functions run on the server, giving you the backend-for-frontend logic right alongside your components. There's no context switching between languages, no manual API typing, and no wondering whether your frontend and backend are in sync.

It's not just about reducing work—it's about reducing the cognitive overhead of building web applications.

## Key Takeaways

Building this Matrix chat application with React Router 7 reinforced several important principles:

### More Belongs in Loaders and Actions Than You Think

Initially, I tried to keep server-side logic minimal, but I discovered that pushing more logic into loaders and actions creates a better user experience. Authentication checks, data validation, business logic, and even complex data transformations work better on the server where they can fail fast and provide immediate feedback. I even ditched entirely the typescript sdk for matrix in favour of doing every query and command in the loader / action, and having a bunch of custom hooks which would listend for events comming.

### Embrace URL State

Put as much state as possible in the URL—it's easier for both developers and users. Room IDs, filter states, pagination, and even UI preferences can live in the URL. This makes the application more shareable, bookmarkable, and debuggable. React Router's nested routing makes this natural and maintainable.

### Progressive Enhancement Isn't Just Nice-to-Have

When your app works without JavaScript, you've built something fundamentally more resilient. It will work on slow networks, older devices, and in environments where JavaScript fails to load. But more importantly, you've built something that aligns with the grain of the web rather than fighting against it.

### The Framework Handles the Hard Parts

React Router 7 eliminates so much boilerplate around form handling, loading states, error boundaries, and data synchronization. You write declarative loaders and actions, and the framework handles optimistic updates, race conditions, and state management automatically.

## Conclusion

React is evolving back toward the web's fundamental principles, and that's not a step backward—it's a step forward with better tools. Server-side rendering, progressive enhancement, and unobtrusive JavaScript aren't old-fashioned ideas; they're timeless principles that modern frameworks are finally making approachable.

The Matrix chat application demonstrates that you can build rich, interactive experiences without sacrificing accessibility, performance, or reliability. When your React app works with JavaScript disabled, you know you've built something that truly embraces the web platform.

Try it yourself: disable JavaScript in your browser and see how many of your favorite web applications still work. Then imagine building your next project with progressive enhancement from day one. The web—and your users—will thank you for it.



