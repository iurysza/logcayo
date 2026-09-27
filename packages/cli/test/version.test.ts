import { describe, expect, spyOn, test } from "bun:test";
import packageJson from "../package.json" with { type: "json" };
import { main } from "../src/main.ts";

describe("logcayo --version", () => {
	test("prints the package version and exits 0", async () => {
		const writes: string[] = [];

		const spy = spyOn(process.stdout, "write").mockImplementation((chunk) => {
			writes.push(String(chunk));

			return true;
		});

		try {
			for (const flag of ["--version", "-v", "version"]) {
				expect(await main(["bun", "logcayo", flag])).toBe(0);
			}
		} finally {
			spy.mockRestore();
		}

		expect(writes).toEqual(Array(3).fill(`logcayo ${packageJson.version}\n`));
	});
});
