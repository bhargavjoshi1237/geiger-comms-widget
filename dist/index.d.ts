import type { GeigerCommsApi } from "./types";
export type { GeigerCommsApi, GeigerCommsSettings, GeigerSpace, WidgetEvent, } from "./types";
/** Points future loads at a different deployment (e.g. localhost:3000 in dev). */
export declare function configure(options?: {
    scriptUrl?: string;
}): void;
export declare const GeigerComms: GeigerCommsApi;
export default GeigerComms;
