// View model for the messenger UI.
//
// These types describe what the panel renders, not what the transport sends.
// The loader in ../index.ts still owns the network surface; everything here is
// plain data a host (or the demo) can hand to <Messenger>.
export function tabForView(view) {
    switch (view.kind) {
        case "home":
            return "home";
        case "messages":
            return "messages";
        case "help":
            return "help";
        default:
            // Sub-screens (a thread, an article, the composer) hide the nav so the
            // panel reads as one task rather than a tab you happen to be inside.
            return null;
    }
}
