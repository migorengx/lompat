import { strict as assert } from "node:assert";
import Lompat, { add } from "./index";

export function testAdd() {
	assert.equal(add(1, 1), 2);
}

export function testLompat() {
	const windowMock = {
		parent: {
			postMessage: () => {}
		}
	} as unknown as Partial<Window>;
    const lompat = new Lompat(windowMock)
	lompat.start()
	lompat.send("test", () => {
		console.log("callback balik")
	})
}
