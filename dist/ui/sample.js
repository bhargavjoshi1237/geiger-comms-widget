// The design's placeholder content: host brand "Northwind", AI persona "Aria",
// agents Maya Chen and Dan Rivera, order #48120.
//
// Exported so the demo renders exactly what the canvas draws, and so a host can
// use it as a shape reference when wiring real data.
export const ARIA = {
    id: "aria",
    name: "Aria",
    initials: "AI",
    ai: true,
    role: "Northwind · answers in seconds",
};
export const MAYA = {
    id: "maya",
    name: "Maya Chen",
    initials: "MC",
    online: true,
    role: "Northwind support · typically 2m",
};
export const DAN = {
    id: "dan",
    name: "Dan Rivera",
    initials: "DR",
};
const ARTICLES = [
    {
        id: "a-late",
        title: "Why is my delivery late?",
        excerpt: "Weather, customs and peak weeks are the usual causes. Here's how to tell which one applies.",
        category: "Delivery",
        readingTime: "2 min read",
        author: DAN,
        updated: "3 days ago",
        blocks: [
            {
                type: "lead",
                text: "Most late parcels are late for one of three reasons, and the tracking page usually tells you which.",
            },
            { type: "heading", text: "Stuck at the local hub" },
            {
                type: "paragraph",
                text: "Hubs re-sort overnight. If the last scan is under 24 hours old, it will almost certainly move today.",
            },
            { type: "heading", text: "Failed delivery attempt" },
            {
                type: "paragraph",
                text: "The courier retries the next working day. You can redirect it to a pickup point from the tracking page.",
            },
            {
                type: "callout",
                text: "Past 10 working days with no scan? Open a claim — you'll be refunded in full.",
            },
        ],
    },
    {
        id: "a-missing",
        title: "Parcel marked delivered but missing",
        excerpt: "What to check first, and when to open a claim.",
        category: "Delivery",
        readingTime: "3 min read",
        author: DAN,
        updated: "1 week ago",
        blocks: [
            {
                type: "lead",
                text: "Couriers scan a parcel as delivered when they hand it over — to you, a neighbour, or a safe-drop spot.",
            },
            { type: "heading", text: "Check the obvious places first" },
            {
                type: "paragraph",
                text: "Porches, side gates, bin stores and immediate neighbours account for most parcels reported missing.",
            },
            {
                type: "callout",
                text: "Still nothing by the end of the next working day? Open a claim and we'll refund or resend.",
            },
        ],
    },
    {
        id: "a-address",
        title: "Changing a delivery address",
        excerpt: "Possible until the parcel reaches your local hub.",
        category: "Delivery",
        readingTime: "1 min read",
        author: MAYA,
        updated: "2 weeks ago",
        blocks: [
            {
                type: "lead",
                text: "You can redirect an order any time before it is scanned into the hub nearest the delivery address.",
            },
            {
                type: "paragraph",
                text: "After that the courier owns the parcel and you'll need to redirect it from their tracking page instead.",
            },
        ],
    },
    {
        id: "a-claim",
        title: "Filing a delivery claim",
        excerpt: "What we need from you, and how long a claim takes to settle.",
        category: "Delivery",
        readingTime: "2 min read",
        author: DAN,
        updated: "5 days ago",
        blocks: [
            {
                type: "lead",
                text: "A claim asks the courier to confirm what happened to a parcel. Most settle within three working days.",
            },
            {
                type: "paragraph",
                text: "We'll need the order number and, for damage, a photo. Aria can open the claim for you in the chat.",
            },
        ],
    },
];
const CONVERSATIONS = [
    // 2a — handed off to a human.
    {
        id: "c-refund",
        title: "Refund for order #48120",
        with: MAYA,
        preview: "Refund is approved — it should land in 3–5 days.",
        previewAuthor: "Maya",
        time: "14:08",
        status: "open",
        unread: 1,
        typing: true,
        transcriptNudge: "Leaving? We'll email the rest of this to sam@…",
        messages: [
            {
                id: "m1",
                author: "ai",
                body: "I've pulled up your order and the claim form — a teammate can approve this faster than I can. Passing you over.",
            },
            { id: "m2", author: "system", body: "ARIA HANDED THIS TO MAYA · 14:06" },
            {
                id: "m3",
                author: "agent",
                from: MAYA,
                body: "Hi Sam — I can see the whole thread, no need to repeat yourself. I've approved the refund for #48120.",
            },
            {
                id: "m4",
                author: "visitor",
                body: "Amazing, thank you. How long until it shows up?",
                readReceipt: "Read 14:08",
            },
        ],
    },
    // 1a — the live AI conversation the "Ask Aria" card opens.
    {
        id: "c-ask",
        title: "Parcel marked delivered but missing",
        with: ARIA,
        preview: "Still missing? I can open a claim for you now.",
        previewAuthor: "Aria",
        time: "14:02",
        status: "open",
        dayMark: "Today 14:02",
        quickReplies: ["Open a claim", "Track it again", "Talk to a person"],
        messages: [
            {
                id: "a1",
                author: "visitor",
                body: "My order says delivered but nothing arrived. What do I do?",
            },
            {
                id: "a2",
                author: "ai",
                body: "Sorry about that. Parcels marked delivered do occasionally turn up a day late, so start here:",
                steps: [
                    { text: "Check with neighbours and any safe-drop spot." },
                    { text: "Wait until end of the next working day." },
                    { text: "Still missing? I can open a claim for you now." },
                ],
                sources: [
                    { articleId: "a-missing", title: "Parcel marked delivered but missing" },
                    { articleId: "a-claim", title: "Filing a delivery claim" },
                ],
                askFeedback: true,
            },
        ],
    },
    {
        id: "c-delivery",
        title: "Delivery window for #48120",
        with: ARIA,
        preview: "Arriving today, 17:00 – 21:00.",
        previewAuthor: "Aria",
        time: "Mon",
        status: "waiting",
        dayMark: "Monday 09:12",
        messages: [
            { id: "d1", author: "visitor", body: "When is #48120 turning up?" },
            { id: "d2", author: "ai", body: "Arriving today, 17:00 – 21:00. Want me to text you when the courier is 30 minutes away?" },
        ],
    },
    // 2i — attachments.
    {
        id: "c-blender",
        title: "Faulty blender jug",
        with: ARIA,
        preview: "A photo of the damage lets me approve the return straight away.",
        previewAuthor: "Aria",
        time: "14:11",
        status: "open",
        attachmentMode: true,
        messages: [
            {
                id: "b1",
                author: "ai",
                body: "A photo of the damage lets me approve the return straight away.",
            },
            {
                id: "b2",
                author: "visitor",
                readReceipt: "Sent 14:11",
                attachments: [{ id: "f1", name: "jug-crack.jpg", size: "1.2 MB", kind: "image" }],
            },
            {
                id: "b3",
                author: "visitor",
                attachments: [{ id: "f2", name: "receipt-48120.pdf", kind: "file", progress: 64 }],
            },
            {
                id: "b4",
                author: "visitor",
                attachments: [
                    {
                        id: "f3",
                        name: "video-clip.mov",
                        kind: "image",
                        error: "Too large — 25 MB max. Try a photo instead.",
                    },
                ],
            },
        ],
    },
    // 2h — closed, awaiting a rating.
    {
        id: "c-closed",
        title: "Refund for order #47993",
        with: MAYA,
        preview: "All sorted — refund is on its way.",
        previewAuthor: "Maya",
        time: "14:21",
        status: "closed",
        awaitingRating: true,
        closedAt: "14:21",
        messages: [
            {
                id: "r1",
                author: "agent",
                from: MAYA,
                body: "All sorted — refund is on its way. Anything else, just reopen this thread.",
            },
            { id: "r2", author: "system", body: "CLOSED 14:21" },
        ],
    },
    {
        id: "c-invoice",
        title: "Invoice for July",
        with: DAN,
        preview: "Sent it to your billing email.",
        previewAuthor: "Dan",
        time: "12 Aug",
        status: "closed",
        messages: [
            { id: "i1", author: "visitor", body: "Could you resend the July invoice?" },
            { id: "i2", author: "agent", from: DAN, body: "Sent it to your billing email." },
        ],
    },
];
export const sampleData = {
    brand: { name: "Northwind Support", initials: "N" },
    assistant: {
        name: "Aria",
        tagline: "Answers instantly from our help centre. Hands over to the team whenever you ask.",
    },
    team: [MAYA, DAN],
    conversations: CONVERSATIONS,
    articles: ARTICLES,
    orders: [
        { id: "48120", label: "#48120 · Blender, 2 items", status: "Out for delivery today" },
        { id: "47993", label: "#47993 · Kettle", status: "Delivered 12 Aug" },
    ],
    topics: ["An order", "Returns", "Billing", "Account", "Something else"],
    online: true,
    backAt: "09:00 GMT",
    visitorEmail: "sam@example.com",
    proactive: {
        from: MAYA,
        when: "Just now",
        body: "Saw you looking at the returns policy. Want me to check whether your order is still inside the window?",
        confirmLabel: "Yes, check it",
        dismissLabel: "No thanks",
    },
};
