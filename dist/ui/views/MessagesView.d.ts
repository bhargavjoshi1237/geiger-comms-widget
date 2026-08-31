import type { Conversation, Person } from "../model";
export declare function MessagesView({ conversations, team, onOpen, onNew, }: {
    conversations: Conversation[];
    team: Person[];
    onOpen: (id: string) => void;
    onNew: () => void;
}): import("react").JSX.Element;
