import type { LogMetadata, TextSlice } from "./types.ts";
import { isLogLevel } from "./types.ts";
import type { FramedLine } from "./framing.ts";

export type ParsedLine =
	| { kind: "control"; control: "blank" | "buffer-marker" }
	| {
			kind: "event";
			rawText: string;
			metadata: LogMetadata | null;
			invalidUtf8: boolean;
	  };

const BUFFER_MARKER = /^-+ beginning of /;

// Logcat prints the account name instead of the UID when the name has at most 5 characters.
const UID_HEADER =
	/^[ \t]*(\d{1,16})\.(\d{6})[ \t]+(\d{1,10}|[a-z][a-z0-9_]{0,31})[ \t]+(\d{1,10})[ \t]+(\d{1,10})[ \t]([VDIWEF])[ \t]([^:]*):(.*)$/;

const LEGACY_HEADER =
	/^[ \t]*(\d{1,16})\.(\d{6})[ \t]+(\d{1,10})[ \t]+(\d{1,10})[ \t]([VDIWEF])[ \t]([^:]*):(.*)$/;

type DecodedText = Readonly<{
	text: string;
	invalidUtf8: boolean;
}>;

const utf8Fatal = new TextDecoder("utf-8", { fatal: true });

const utf8Replace = new TextDecoder("utf-8", { fatal: false });

// Android system accounts whose names logcat prints instead of the UID.
const NAMED_UIDS: ReadonlyMap<string, number> = new Map([
	["root", 0], ["radio", 1001], ["input", 1004], ["audio", 1005], ["log", 1007], ["mount", 1009],
	["wifi", 1010], ["adb", 1011], ["media", 1013], ["dhcp", 1014], ["vpn", 1016], ["usb", 1018],
	["drm", 1019], ["mdnsr", 1020], ["gps", 1021], ["mtp", 1024], ["nfc", 1027], ["clat", 1029],
	["logd", 1036], ["dbus", 1038], ["nvram", 1050], ["dns", 1051], ["ese", 1060], ["hsm", 1064],
	["lmkd", 1069], ["llkd", 1070], ["gsid", 1074], ["artd", 1082], ["uwb", 1083], ["diced", 1085],
	["mmd", 1095], ["pmgd", 1098], ["shell", 2000], ["cache", 2001], ["diag", 2002], ["inet", 3003],
	["uhid", 3011], ["misc", 9998],
]);

const USER_UID_NAME = /^u(\d{1,4})_([ai])(\d{1,5})$/;

/** Resolves a logcat UID column, numeric or named, to a UID. Unknown names resolve to null. */
function uidFromText(text: string): number | null {
	if (/^\d+$/.test(text)) return Number(text);

	const user = USER_UID_NAME.exec(text);

	if (user) return Number(user[1]) * 100_000 + (user[2] === "a" ? 10_000 : 90_000) + Number(user[3]);

	return NAMED_UIDS.get(text) ?? null;
}

function decodeUtf8(bytes: Uint8Array): DecodedText {
	try {
		return { text: utf8Fatal.decode(bytes), invalidUtf8: false };
	} catch {
		return { text: utf8Replace.decode(bytes), invalidUtf8: true };
	}
}

function sliceOf(text: string, start: number, end: number): TextSlice {
	return { start, end };
}

function parseMetadata(rawText: string): LogMetadata | null {
	const uidMatch = UID_HEADER.exec(rawText);
	const match = uidMatch ?? LEGACY_HEADER.exec(rawText);

	if (!match) return null;
	const seconds = match[1]!;
	const micros = match[2]!;
	const uidText = uidMatch ? match[3]! : null;
	const pidText = uidMatch ? match[4]! : match[3]!;
	const tidText = uidMatch ? match[5]! : match[4]!;
	const levelText = uidMatch ? match[6]! : match[5]!;
	const tag = uidMatch ? match[7]! : match[6]!;
	const message = uidMatch ? match[8]! : match[7]!;

	if (!isLogLevel(levelText)) return null;

	const secondsNum = Number(seconds);
	const microsNum = Number(micros);

	if (!Number.isSafeInteger(secondsNum) || !Number.isSafeInteger(microsNum)) return null;

	if (secondsNum < 0 || microsNum < 0 || microsNum > 999_999) return null;

	if (secondsNum > Math.floor(Number.MAX_SAFE_INTEGER / 1_000_000)) return null;

	const epochMicros = secondsNum * 1_000_000 + microsNum;

	if (!Number.isSafeInteger(epochMicros)) return null;

	const uid = uidText === null ? null : uidFromText(uidText);
	const pid = Number(pidText);
	const tid = Number(tidText);

	if (uid !== null && (!Number.isSafeInteger(uid) || uid < 0)) return null;

	if (!Number.isSafeInteger(pid) || pid < 0) return null;

	if (!Number.isSafeInteger(tid) || tid < 0) return null;

	const prefixLength = rawText.length - (tag.length + 1 + message.length);
	const tagStart = prefixLength;
	const tagEnd = tagStart + tag.length;
	const messageStart = tagEnd + 1;
	const messageTrimStart = message.startsWith(" ") ? messageStart + 1 : messageStart;

	return {
		epochMicros,
		uid,
		pid,
		tid,
		level: levelText,
		tag: sliceOf(rawText, tagStart, tagEnd),
		message: sliceOf(rawText, messageTrimStart, rawText.length),
	};
}

export function parseLogcatLine(line: FramedLine): ParsedLine {
	const decoded = decodeUtf8(line.bytes);
	const rawText = decoded.text;

	if (rawText.length === 0) {
		return { kind: "control", control: "blank" };
	}

	if (BUFFER_MARKER.test(rawText)) {
		return { kind: "control", control: "buffer-marker" };
	}

	return {
		kind: "event",
		rawText,
		metadata: parseMetadata(rawText),
		invalidUtf8: decoded.invalidUtf8,
	};
}

export function tagText(rawText: string, tag: TextSlice): string {
	return rawText.slice(tag.start, tag.end);
}

export function messageText(rawText: string, message: TextSlice): string {
	return rawText.slice(message.start, message.end);
}

/** Android splits one log call into lines that repeat the same header. */
export function isSameLogCall(headRaw: string, head: LogMetadata, lineRaw: string, line: LogMetadata): boolean {
	return head.epochMicros === line.epochMicros
		&& head.pid === line.pid
		&& head.tid === line.tid
		&& head.level === line.level
		&& (head.uid ?? null) === (line.uid ?? null)
		&& tagText(headRaw, head.tag) === tagText(lineRaw, line.tag);
}

/** Returns a continuation's message, without the repeated logcat header when it has one. */
export function continuationText(line: string): string {
	const metadata = parseMetadata(line);

	return metadata ? messageText(line, metadata.message) : line;
}
